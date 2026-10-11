"""Assert receipt fidelity and source conventions; this is not browser or UX QA.

Run: python validate_viewer.py RUN_FOLDER [--repo REPOSITORY]
Node evaluates only the data prefix in a restricted VM context with a timeout.
This checks the known artifact's source, not arbitrary JavaScript security.
"""
import argparse
import hashlib
from html import unescape
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import subprocess


class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.words = []
        self.stack = []
        self.case_groups = {}

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        self.elements.append((tag, attributes))
        if tag == 'button' and 'case-btn' in attributes.get('class', '').split():
            for _, parent, position in reversed(self.stack):
                if parent.get('role') == 'group':
                    self.case_groups.setdefault(position, set()).add(attributes.get('data-case'))
                    break
        if tag not in ('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'):
            self.stack.append((tag, attributes, len(self.elements) - 1))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.words.append(data)


def validate(folder, repo):
    receipt = json.loads((repo / 'evidence/evaluation.json').read_text(encoding='utf-8-sig'))
    javascript = (folder / 'extra.js').read_text(encoding='utf-8-sig')
    body = (folder / 'body.html').read_text(encoding='utf-8-sig')
    index = (folder / 'index.html').read_text(encoding='utf-8-sig')
    marker = re.search(r'\blet\s+activeCaseKey\b', javascript)
    assert marker, 'extra.js must delimit its data before let activeCaseKey'
    prefix = javascript[:marker.start()]
    node = shutil.which('node')
    assert node, 'Node is required for the static data-prefix check'
    extract = r'''const fs=require('fs'),vm=require('vm');
const prefix=fs.readFileSync(0,'utf8');
const context=vm.createContext(Object.create(null),{codeGeneration:{strings:false,wasm:false}});
const output=vm.runInContext(prefix+';JSON.stringify({EVAL_DATA,RAW_EVENTS:typeof RAW_EVENTS==="undefined"?null:RAW_EVENTS,RECEIPT:typeof RECEIPT==="undefined"?null:RECEIPT})',context,{timeout:1000});
process.stdout.write(output);'''
    options = {'creationflags': subprocess.CREATE_NO_WINDOW} if os.name == 'nt' else {}
    process = subprocess.run([node, '-e', extract], input=prefix, text=True, encoding='utf8',
                             capture_output=True, timeout=10, **options)
    assert process.returncode == 0, 'Node data extraction failed: ' + process.stderr[:500]
    exposed = json.loads(process.stdout)
    evaluation = exposed['EVAL_DATA']
    raw = exposed['RAW_EVENTS']
    failures = []
    checks = 0

    def expect(condition, label):
        nonlocal checks
        checks += 1
        try:
            assert condition, label
        except AssertionError:
            failures.append(label)

    expected = {result['case']: result for result in receipt['results']}
    actual = evaluation.get('results', {})
    expect(isinstance(actual, dict) and set(actual) == set(expected), 'EVAL_DATA case set/count')
    expect(evaluation.get('reviewed_code_revision') == receipt['reviewed_code_revision'], 'reviewed_code_revision')
    expect(isinstance(raw, dict) and set(raw) == set(expected), 'RAW_EVENTS case set/count (exact receipt arrays required)')
    if exposed.get('RECEIPT') is not None:
        expect(exposed['RECEIPT'] == receipt, 'RECEIPT exact full-object equality including history/correction/revision labels')
    for case, result in expected.items():
        data = actual.get(case, {}) if isinstance(actual, dict) else {}
        inspection = next(event['result'] for event in result['events'] if event['name'] == 'inspect')
        source = inspection['source']
        tests = inspection['tests']
        expect(data.get('case') == case, case + '.case')
        # These three trusted fixtures use <case>.py; existence/content are checked.
        expect(data.get('file') == case + '.py', case + '.file')
        expect((repo / 'fixtures' / case / (case + '.py')).read_text(encoding='utf8') == source, case + '.exact baseline source file')
        for field in ('run_id', 'steps', 'elapsed_seconds', 'rollbacks', 'source_sha256', 'test_sha256'):
            expect(data.get(field) == result[field], case + '.' + field)
        expect(data.get('base_sha256') == result['baseline']['source_sha256'], case + '.base_sha256')
        for field, value in [('baseline_source', source), ('repaired_source', result['repaired_source']),
                             ('test_contract', tests), ('baseline_stdout', result['baseline']['stdout']),
                             ('final_stdout', result['final_verification']['stdout'])]:
            expect(data.get(field) == value, case + '.' + field)
        for field, verification in [('checks_baseline', result['baseline']), ('checks_final', result['final_verification'])]:
            counts = re.findall(r'(\d+/\d+) fixture checks passed', verification['stdout'])
            displayed = data.get(field)
            if len(counts) == 1 and isinstance(displayed, dict):
                passed, total = map(int, counts[0].split('/'))
                matches = displayed.get('passed') == passed and displayed.get('total') == total and displayed.get('text') == counts[0]
            else:
                matches = len(counts) == 1 and displayed == counts[0]
            expect(matches, case + '.' + field)
        expect(data.get('usage') == result['usage'], case + '.usage (complete receipt object)')
        expect(hashlib.sha256(source.encode('utf8')).hexdigest() == result['baseline']['source_sha256'], case + '.receipt baseline digest')
        expect(hashlib.sha256(result['repaired_source'].encode('utf8')).hexdigest() == result['source_sha256'], case + '.receipt repaired digest')
        expect((repo / 'fixtures' / case / 'test_case.py').read_text(encoding='utf8') == tests, case + '.exact test_case.py')
        expect(hashlib.sha256((repo / 'fixtures' / case / 'test_case.py').read_bytes()).hexdigest() == result['test_sha256'], case + '.immutable test digest')
        expect(isinstance(data.get('events'), list) and len(data['events']) == len(result['events']), case + '.summary event count')
        expect(isinstance(raw, dict) and raw.get(case) == result['events'], case + '.RAW_EVENTS exact array equality')

    parsed = Tags()
    parsed.feed(body)
    syntax = subprocess.run([node, '--check', str(folder / 'extra.js')], text=True, encoding='utf8',
                            capture_output=True, timeout=10, **options)
    expect(syntax.returncode == 0, 'full extra.js syntax check')
    ids = [attributes['id'] for _, attributes in parsed.elements if 'id' in attributes]
    expect(len(ids) == len(set(ids)), 'body element IDs are unique')
    references = set(re.findall(r'(?:getElementById|setTxt)\s*\(\s*["\']([^"\']+)["\']', javascript[marker.start():]))
    expect(references <= set(ids), 'all literal runtime display/control IDs exist in body')
    plain = ' '.join(' '.join(parsed.words).split())
    expect(not re.search(r'all\s+(?:three\s+)?runs\s+(?:(?:were|are)\s+)?(?:recorded|run|executed|captured|produced)[^.]{0,180}revision', plain, re.I),
           'body must not claim all development runs were recorded at reviewed revision')
    expect(not any(attributes.get('role') in ('tab', 'tablist') or 'aria-selected' in attributes for _, attributes in parsed.elements),
           'native button group: no tab/tablist roles or aria-selected')
    buttons = [(tag, attributes) for tag, attributes in parsed.elements if 'case-btn' in attributes.get('class', '').split()]
    expect(len(buttons) == len(expected) and {attributes.get('data-case') for _, attributes in buttons} == set(expected), 'native case button count/keys')
    expect(all(tag == 'button' and attributes.get('type') == 'button' and attributes.get('aria-pressed') in ('true', 'false') for tag, attributes in buttons),
           'case selectors must be native buttons with aria-pressed')
    expect(sum(attributes.get('aria-pressed') == 'true' for _, attributes in buttons) == 1, 'exactly one initial case button pressed')
    expect(any(keys == set(expected) and parsed.elements[position][1].get('aria-label') for position, keys in parsed.case_groups.items()), 'all case selectors within one labelled role=group')
    expect(not any(attributes.get('role') == 'toolbar' for _, attributes in parsed.elements), 'native filter group has no unimplemented toolbar role')
    expect(not any(attributes.get('id') in ('eventsList', 'timeline-list') and 'aria-live' in attributes for _, attributes in parsed.elements), 'whole dense event list is not an aria-live region')
    expect('aria-selected' not in javascript and 'aria-pressed' in javascript, 'JavaScript updates aria-pressed')
    expect('test_case.py' in body, 'immutable contract static display uses exact test_case.py name')
    expect(not re.search(r'test_\s*["\']\s*\+\s*data\.file', javascript), 'no fabricated test_<source>.py title')
    original = r'(?:originalIndex|original_index)'
    raw_aliases = re.findall(r'\b(?:const|let)\s+(\w+)\s*=\s*RAW_EVENTS\s*\[\s*activeCaseKey\s*\]', javascript)
    bases = [r'RAW_EVENTS\s*\[\s*activeCaseKey\s*\]'] + [re.escape(alias) for alias in raw_aliases]
    raw_lookup = any(re.search(base + r'\s*\[\s*(?:\w+\.)?' + original + r'\s*\]', javascript) for base in bases)
    expect(bool(raw_lookup) and bool(re.search(r'JSON\.stringify\s*\(', javascript)), 'raw disclosure reads RAW_EVENTS by original index')
    runtime = javascript[marker.start():]
    expect(bool(re.search(r'\.map\s*\([\s\S]{0,250}' + original + r'[\s\S]{0,250}\.filter\s*\(', runtime)), 'attach original event index before recovery filtering')
    for filename, content in [('extra.js', javascript), ('body.html', body), ('index.html', index)]:
        expect(not re.search(r'\b(?:fetch|eval)\s*\(|\.\s*innerHTML\b|\[\s*["\']innerHTML["\']\s*\]', content), filename + ': no fetch/eval/innerHTML use')
    return {'artifact': str(folder.resolve()), 'evidence': str((repo / 'evidence/evaluation.json').resolve()),
            'status': 'passed' if not failures else 'failed', 'checks': checks, 'failures': failures,
            'scope': 'Static receipt-data and source-convention assertions only; no browser, interaction, visual or accessibility QA claim.',
            'source_sha256': {name: hashlib.sha256((folder / name).read_bytes()).hexdigest() for name in ('extra.js', 'body.html', 'index.html')}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('run_folder', type=Path)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    arguments = parser.parse_args()
    result = validate(arguments.run_folder, arguments.repo)
    print(json.dumps(result, indent=2))
    assert result['status'] == 'passed', 'Static viewer validation failed: ' + ', '.join(result['failures'])


if __name__ == '__main__':
    main()
