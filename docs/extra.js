// Authoritative unedited receipt embedded directly
const RECEIPT = {
  "time_utc": "2026-10-11T13:11:40.701673+00:00",
  "reviewed_code_revision": "ad2ac2fea21a62bf46152fff7ed734283e12c808",
  "revision_note": "Current reviewed code revision; individual runs occurred during development. Exact repaired-source and immutable-test digests are recorded per case.",
  "scope": "Three fresh synthetic arithmetic policies; not a benchmark or arbitrary repository repair",
  "fault_label": "One controlled CI-worker outage per case; not a model-authored defect",
  "interruption_label": "Fresh instance from a checkpoint; not an actual process crash",
  "neatlogs_export_configured": false,
  "results": [
    {
      "case": "backoff",
      "mode": "agy",
      "run_id": "20261011T130905Z-330e417c",
      "status": "verified",
      "steps": 6,
      "elapsed_seconds": 46.46,
      "baseline": {
        "exit_code": 1,
        "stdout": "FAIL retry_delay(5, 1, 30): expected 30, got 32\nFAIL retry_delay(10, 1, 30): expected 30, got 1024\nFAIL retry_delay(5, 2, 30): expected 30, got 64\nFAIL retry_delay(2, 1, 3): expected 3, got 4\nFAIL retry_delay(-1, 1, 30): expected ValueError\nFAIL retry_delay(0, 0, 30): expected ValueError\nFAIL retry_delay(0, 1, 0): expected ValueError\nFAIL retry_delay(0, -1, 30): expected ValueError\nFAIL retry_delay(0, 1, -1): expected ValueError\n4/13 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "d3a9b93d9a163655d10c580b05e1329fc0955041a0fd1dc0e84b75beeb54145d"
      },
      "final_verification": {
        "exit_code": 0,
        "stdout": "13/13 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70"
      },
      "source_sha256": "f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70",
      "test_sha256": "d5f67849dbe58478ae27a3c9edb34c6d49389273c1f3b1c231e22db8dae2e457",
      "rollbacks": 1,
      "tool_errors": 0,
      "intentional_interruption": true,
      "controlled_worker_fault": true,
      "model": "claude-opus-5-5-high",
      "usage": {
        "input_tokens": 45078,
        "output_tokens": 2266,
        "thinking_tokens": 0,
        "cache_read_tokens": 79272,
        "total_tokens": 47344
      },
      "cost": "Provider CLI did not report monetary cost",
      "events": [
        {
          "time_utc": "2026-10-11T13:09:05.331417+00:00",
          "step": 0,
          "name": "baseline",
          "duration_seconds": 0,
          "result": {
            "exit_code": 1,
            "stdout": "FAIL retry_delay(5, 1, 30): expected 30, got 32\nFAIL retry_delay(10, 1, 30): expected 30, got 1024\nFAIL retry_delay(5, 2, 30): expected 30, got 64\nFAIL retry_delay(2, 1, 3): expected 3, got 4\nFAIL retry_delay(-1, 1, 30): expected ValueError\nFAIL retry_delay(0, 0, 30): expected ValueError\nFAIL retry_delay(0, 1, 0): expected ValueError\nFAIL retry_delay(0, -1, 30): expected ValueError\nFAIL retry_delay(0, 1, -1): expected ValueError\n4/13 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "d3a9b93d9a163655d10c580b05e1329fc0955041a0fd1dc0e84b75beeb54145d"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:12.041404+00:00",
          "step": 0,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "inspect"
            },
            "usage": {
              "input_tokens": 6376,
              "output_tokens": 273,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 6649
            },
            "duration_seconds": 3.3775713,
            "cost": "not reported",
            "provider_receipt": "provider/decision-0-dae5ab3b.ndjson"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:12.056265+00:00",
          "step": 1,
          "name": "inspect",
          "duration_seconds": 0.0031,
          "result": {
            "source": "def retry_delay(attempt, base=1, cap=30):\n    \"\"\"Return the bounded delay for a zero-based retry attempt.\"\"\"\n    return base * 2 ** attempt\n",
            "tests": "\"\"\"Trusted, immutable fixture contract: no framework needed.\"\"\"\nfrom backoff import retry_delay\n\ncases = [(0, 1, 30, 1), (1, 1, 30, 2), (5, 1, 30, 30), (10, 1, 30, 30),\n         (0, 2, 30, 2), (3, 2, 30, 16), (5, 2, 30, 30), (2, 1, 3, 3)]\nfailures = []\nfor attempt, base, cap, expected in cases:\n    actual = retry_delay(attempt, base, cap)\n    if actual != expected:\n        failures.append(f'retry_delay({attempt}, {base}, {cap}): expected {expected}, got {actual}')\ninvalid = [(-1, 1, 30), (0, 0, 30), (0, 1, 0), (0, -1, 30), (0, 1, -1)]\nfor args in invalid:\n    try:\n        retry_delay(*args)\n    except ValueError:\n        pass\n    else:\n        failures.append(f'retry_delay{args}: expected ValueError')\nfor failure in failures:\n    print('FAIL ' + failure)\ncount = len(cases) + len(invalid)\nprint(f'{count - len(failures)}/{count} fixture checks passed')\nraise SystemExit(bool(failures))\n"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:20.867217+00:00",
          "step": 1,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "content": "def retry_delay(attempt, base=1, cap=30):\n    \"\"\"Return the bounded delay for a zero-based retry attempt.\"\"\"\n    if attempt < 0 or base <= 0 or cap <= 0:\n        raise ValueError(\"attempt must be >= 0 and base/cap must be > 0\")\n    return min(cap, base * 2 ** attempt)\n",
                "path": "backoff.py",
                "reason": "Reject invalid inputs (negative attempt, non-positive base or cap) with ValueError and clamp exponential delay to cap via min; signature and defaults preserved."
              },
              "name": "replace_source"
            },
            "usage": {
              "input_tokens": 7049,
              "output_tokens": 629,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 7678
            },
            "duration_seconds": 5.8940851,
            "cost": "not reported",
            "provider_receipt": "provider/decision-1-c66aa8e2.ndjson"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:20.900089+00:00",
          "step": 2,
          "name": "replace_source",
          "duration_seconds": 0.0068,
          "result": {
            "applied": true,
            "sha256": "f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70",
            "reason": "Reject invalid inputs (negative attempt, non-positive base or cap) with ValueError and clamp exponential delay to cap via min; signature and defaults preserved."
          }
        },
        {
          "time_utc": "2026-10-11T13:09:20.930969+00:00",
          "step": 2,
          "name": "intentional_checkpoint_resume",
          "duration_seconds": 0,
          "result": {
            "checkpoint_step": 2,
            "method": "New RepairRun instance from persisted state; no fake process crash"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:28.758931+00:00",
          "step": 2,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "verify"
            },
            "usage": {
              "input_tokens": 7488,
              "output_tokens": 221,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 7709
            },
            "duration_seconds": 3.2942168,
            "cost": "not reported",
            "provider_receipt": "provider/decision-2-e4cdb408.ndjson"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:28.791941+00:00",
          "step": 3,
          "name": "injected_worker_failure",
          "duration_seconds": 0,
          "result": {
            "exit_code": 75,
            "stdout": "",
            "stderr": "Controlled evaluation fault: CI worker unavailable. Retry with a fresh candidate.",
            "injected_fault": "one transient worker outage; not a model-proposed code defect"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:28.808213+00:00",
          "step": 3,
          "name": "verify",
          "duration_seconds": 0.0337,
          "result": {
            "exit_code": 75,
            "stdout": "",
            "stderr": "Controlled evaluation fault: CI worker unavailable. Retry with a fresh candidate.",
            "injected_fault": "one transient worker outage; not a model-proposed code defect",
            "reverted_failed_candidate": true
          }
        },
        {
          "time_utc": "2026-10-11T13:09:37.422633+00:00",
          "step": 3,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "content": "def retry_delay(attempt, base=1, cap=30):\n    \"\"\"Return the bounded delay for a zero-based retry attempt.\"\"\"\n    if attempt < 0 or base <= 0 or cap <= 0:\n        raise ValueError(\"attempt must be >= 0 and base/cap must be > 0\")\n    return min(cap, base * 2 ** attempt)\n",
                "path": "backoff.py",
                "reason": "Re-apply the same candidate. The last verify failed because of a temporary CI worker outage (exit 75), not a code defect, and the candidate was rolled back. It rejects bad inputs (negative attempt, base or cap of zero or less) with ValueError and limits the delay to cap using min. The signature and defaults are unchanged."
              },
              "name": "replace_source"
            },
            "usage": {
              "input_tokens": 7643,
              "output_tokens": 542,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 8185
            },
            "duration_seconds": 5.7412145,
            "cost": "not reported",
            "provider_receipt": "provider/decision-3-10a692a3.ndjson"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:37.440487+00:00",
          "step": 4,
          "name": "replace_source",
          "duration_seconds": 0.0046,
          "result": {
            "applied": true,
            "sha256": "f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70",
            "reason": "Re-apply the same candidate. The last verify failed because of a temporary CI worker outage (exit 75), not a code defect, and the candidate was rolled back. It rejects bad inputs (negative attempt, base or cap of zero or less) with ValueError and limits the delay to cap using min. The signature and defaults are unchanged."
          }
        },
        {
          "time_utc": "2026-10-11T13:09:43.577278+00:00",
          "step": 4,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "verify"
            },
            "usage": {
              "input_tokens": 8185,
              "output_tokens": 169,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 8354
            },
            "duration_seconds": 2.9976275,
            "cost": "not reported",
            "provider_receipt": "provider/decision-4-b4f1e782.ndjson"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:43.716523+00:00",
          "step": 5,
          "name": "verify",
          "duration_seconds": 0.1227,
          "result": {
            "exit_code": 0,
            "stdout": "13/13 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:51.498050+00:00",
          "step": 5,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "summary": "Fixed retry_delay in backoff.py and kept its signature (attempt, base=1, cap=30). It now raises ValueError if attempt < 0, base <= 0 or cap <= 0. Otherwise it returns min(cap, base * 2 ** attempt). The first verify run didn't test the code: the CI worker was down (exit 75) and the candidate was rolled back. I re-applied the same candidate and the second verify run passed all 13 fixture checks (exit 0, source sha256 f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70)."
              },
              "name": "finish"
            },
            "usage": {
              "input_tokens": 8337,
              "output_tokens": 432,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 8769
            },
            "duration_seconds": 4.8331757,
            "cost": "not reported",
            "provider_receipt": "provider/decision-5-c545af7a.ndjson"
          }
        },
        {
          "time_utc": "2026-10-11T13:09:51.512062+00:00",
          "step": 6,
          "name": "finish",
          "duration_seconds": 0.002,
          "result": {
            "status": "verified",
            "summary": "Fixed retry_delay in backoff.py and kept its signature (attempt, base=1, cap=30). It now raises ValueError if attempt < 0, base <= 0 or cap <= 0. Otherwise it returns min(cap, base * 2 ** attempt). The first verify run didn't test the code: the CI worker was down (exit 75) and the candidate was rolled back. I re-applied the same candidate and the second verify run passed all 13 fixture checks (exit 0, source sha256 f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70)."
          }
        },
        {
          "time_utc": "2026-10-11T13:09:51.650669+00:00",
          "step": 6,
          "name": "independent_final_verification",
          "duration_seconds": 0,
          "result": {
            "exit_code": 0,
            "stdout": "13/13 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70"
          }
        }
      ],
      "repaired_source": "def retry_delay(attempt, base=1, cap=30):\n    \"\"\"Return the bounded delay for a zero-based retry attempt.\"\"\"\n    if attempt < 0 or base <= 0 or cap <= 0:\n        raise ValueError(\"attempt must be >= 0 and base/cap must be > 0\")\n    return min(cap, base * 2 ** attempt)\n",
      "independent_final_verification": {
        "exit_code": 0,
        "stdout": "13/13 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "f46cdb73ba087e8720576d04e597e2b45808245b9df86b2439daea8694ff8d70"
      }
    },
    {
      "case": "pagination",
      "mode": "agy",
      "run_id": "20261011T130514Z-97e0e5ae",
      "status": "verified",
      "steps": 6,
      "elapsed_seconds": 59.36,
      "baseline": {
        "exit_code": 1,
        "stdout": "FAIL next_offset(950,) {}: AssertionError: expected 1000, got 1050\nFAIL next_offset(1000,) {}: AssertionError: expected None, got 1100\nFAIL next_offset(1001,) {}: AssertionError: expected None, got 1101\nFAIL next_offset(0,) {'total': 7}: AssertionError: expected 7, got 100\nFAIL next_offset(0, 10, 0) {}: AssertionError: expected None, got 10\nFAIL next_offset(1, 1, 1) {}: AssertionError: expected None, got 2\nFAIL next_offset(11, 10, 12) {}: AssertionError: expected 12, got 21\nFAIL next_offset(12, 1, 12) {}: AssertionError: expected None, got 13\nFAIL next_offset(0, 1001, 1000) {}: AssertionError: expected 1000, got 1001\nFAIL next_offset(0, 100, 99) {}: AssertionError: expected 99, got 100\nFAIL next_offset(-1,) {}: expected ValueError\nFAIL next_offset(0, 0) {}: expected ValueError\nFAIL next_offset(0, -1) {}: expected ValueError\nFAIL next_offset(0, 1, -1) {}: expected ValueError\nFAIL next_offset(-1, 0, -1) {}: expected ValueError\nFAIL next_offset(2, 0, 1) {}: expected ValueError\n6/22 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "45a3041a4e9e52acda756a6623698fbd826abf4acd265b2b45d8135bf6965c08"
      },
      "final_verification": {
        "exit_code": 0,
        "stdout": "22/22 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35"
      },
      "source_sha256": "8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35",
      "test_sha256": "55e0343b9dfe0e679bede0dd2d920d268d64e3e58cf31e2e4e8b23cb523f3ad8",
      "rollbacks": 1,
      "tool_errors": 0,
      "intentional_interruption": true,
      "controlled_worker_fault": true,
      "model": "claude-opus-5-5-high",
      "usage": {
        "input_tokens": 50306,
        "output_tokens": 2570,
        "thinking_tokens": 0,
        "cache_read_tokens": 79272,
        "total_tokens": 52876
      },
      "cost": "Provider CLI did not report monetary cost",
      "events": [
        {
          "time_utc": "2026-10-11T13:05:14.556768+00:00",
          "step": 0,
          "name": "baseline",
          "duration_seconds": 0,
          "result": {
            "exit_code": 1,
            "stdout": "FAIL next_offset(950,) {}: AssertionError: expected 1000, got 1050\nFAIL next_offset(1000,) {}: AssertionError: expected None, got 1100\nFAIL next_offset(1001,) {}: AssertionError: expected None, got 1101\nFAIL next_offset(0,) {'total': 7}: AssertionError: expected 7, got 100\nFAIL next_offset(0, 10, 0) {}: AssertionError: expected None, got 10\nFAIL next_offset(1, 1, 1) {}: AssertionError: expected None, got 2\nFAIL next_offset(11, 10, 12) {}: AssertionError: expected 12, got 21\nFAIL next_offset(12, 1, 12) {}: AssertionError: expected None, got 13\nFAIL next_offset(0, 1001, 1000) {}: AssertionError: expected 1000, got 1001\nFAIL next_offset(0, 100, 99) {}: AssertionError: expected 99, got 100\nFAIL next_offset(-1,) {}: expected ValueError\nFAIL next_offset(0, 0) {}: expected ValueError\nFAIL next_offset(0, -1) {}: expected ValueError\nFAIL next_offset(0, 1, -1) {}: expected ValueError\nFAIL next_offset(-1, 0, -1) {}: expected ValueError\nFAIL next_offset(2, 0, 1) {}: expected ValueError\n6/22 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "45a3041a4e9e52acda756a6623698fbd826abf4acd265b2b45d8135bf6965c08"
          }
        },
        {
          "time_utc": "2026-10-11T13:05:25.320164+00:00",
          "step": 0,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "inspect"
            },
            "usage": {
              "input_tokens": 6808,
              "output_tokens": 237,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 7045
            },
            "duration_seconds": 3.4817608,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:05:25.336095+00:00",
          "step": 1,
          "name": "inspect",
          "duration_seconds": 0.0021,
          "result": {
            "source": "def next_offset(offset, page_size=100, total=1000):\n    \"\"\"Return the next page offset, or None when no page remains.\"\"\"\n    return offset + page_size\n",
            "tests": "\"\"\"Trusted, immutable synthetic pagination contract: no framework needed.\"\"\"\nfrom pagination import next_offset\n\ncases = [\n    ((0,), {}, 100),\n    ((950,), {}, 1000),\n    ((1000,), {}, None),\n    ((1001,), {}, None),\n    ((0,), {'total': 7}, 7),\n    ((0, 10), {}, 10),\n    ((0, 10, 0), {}, None),\n    ((0, 1, 1), {}, 1),\n    ((1, 1, 1), {}, None),\n    ((1, 10, 12), {}, 11),\n    ((11, 10, 12), {}, 12),\n    ((11, 1, 12), {}, 12),\n    ((12, 1, 12), {}, None),\n    ((0, 1000, 1000), {}, 1000),\n    ((0, 1001, 1000), {}, 1000),\n    ((0, 100, 99), {}, 99),\n]\ninvalid = [((-1,), {}), ((0, 0), {}), ((0, -1), {}),\n           ((0, 1, -1), {}), ((-1, 0, -1), {}), ((2, 0, 1), {})]\nfailures = []\nfor args, kwargs, expected in cases:\n    try:\n        actual = next_offset(*args, **kwargs)\n        assert actual == expected, f'expected {expected}, got {actual}'\n    except Exception as error:\n        failures.append(f'next_offset{args} {kwargs}: {type(error).__name__}: {error}')\nfor args, kwargs in invalid:\n    try:\n        next_offset(*args, **kwargs)\n    except ValueError:\n        pass\n    except Exception as error:\n        failures.append(f'next_offset{args} {kwargs}: expected ValueError, got {type(error).__name__}')\n    else:\n        failures.append(f'next_offset{args} {kwargs}: expected ValueError')\nfor failure in failures:\n    print('FAIL ' + failure)\ncount = len(cases) + len(invalid)\nprint(f'{count - len(failures)}/{count} fixture checks passed')\nraise SystemExit(bool(failures))\n"
          }
        },
        {
          "time_utc": "2026-10-11T13:05:36.169264+00:00",
          "step": 1,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "content": "def next_offset(offset, page_size=100, total=1000):\n    \"\"\"Return the next page offset, or None when no page remains.\"\"\"\n    if offset < 0:\n        raise ValueError(\"offset must be >= 0\")\n    if page_size <= 0:\n        raise ValueError(\"page_size must be > 0\")\n    if total < 0:\n        raise ValueError(\"total must be >= 0\")\n    if offset >= total:\n        return None\n    return min(offset + page_size, total)\n",
                "path": "pagination.py",
                "reason": "Check the inputs and raise ValueError before computing anything: offset < 0, page_size <= 0 or total < 0. Return None when offset >= total. Otherwise cap the next offset at total with min(offset + page_size, total). The signature, defaults and docstring stay the same, and the code uses only if/return/raise, comparisons, arithmetic, min and ValueError."
              },
              "name": "replace_source"
            },
            "usage": {
              "input_tokens": 7801,
              "output_tokens": 832,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 8633
            },
            "duration_seconds": 7.7677999,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:05:36.185045+00:00",
          "step": 2,
          "name": "replace_source",
          "duration_seconds": 0.0029,
          "result": {
            "applied": true,
            "sha256": "8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35",
            "reason": "Check the inputs and raise ValueError before computing anything: offset < 0, page_size <= 0 or total < 0. Return None when offset >= total. Otherwise cap the next offset at total with min(offset + page_size, total). The signature, defaults and docstring stay the same, and the code uses only if/return/raise, comparisons, arithmetic, min and ValueError."
          }
        },
        {
          "time_utc": "2026-10-11T13:05:36.208926+00:00",
          "step": 2,
          "name": "intentional_checkpoint_resume",
          "duration_seconds": 0,
          "result": {
            "checkpoint_step": 2,
            "method": "New RepairRun instance from persisted state; no fake process crash"
          }
        },
        {
          "time_utc": "2026-10-11T13:05:44.081347+00:00",
          "step": 2,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "verify"
            },
            "usage": {
              "input_tokens": 8422,
              "output_tokens": 206,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 8628
            },
            "duration_seconds": 3.9419048,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:05:44.109214+00:00",
          "step": 3,
          "name": "injected_worker_failure",
          "duration_seconds": 0,
          "result": {
            "exit_code": 75,
            "stdout": "",
            "stderr": "Controlled evaluation fault: CI worker unavailable. Retry with a fresh candidate.",
            "injected_fault": "one transient worker outage; not a model-proposed code defect"
          }
        },
        {
          "time_utc": "2026-10-11T13:05:44.123285+00:00",
          "step": 3,
          "name": "verify",
          "duration_seconds": 0.0285,
          "result": {
            "exit_code": 75,
            "stdout": "",
            "stderr": "Controlled evaluation fault: CI worker unavailable. Retry with a fresh candidate.",
            "injected_fault": "one transient worker outage; not a model-proposed code defect",
            "reverted_failed_candidate": true
          }
        },
        {
          "time_utc": "2026-10-11T13:05:55.344267+00:00",
          "step": 3,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "content": "def next_offset(offset, page_size=100, total=1000):\n    \"\"\"Return the next page offset, or None when no page remains.\"\"\"\n    if offset < 0:\n        raise ValueError(\"offset must be >= 0\")\n    if page_size <= 0:\n        raise ValueError(\"page_size must be > 0\")\n    if total < 0:\n        raise ValueError(\"total must be >= 0\")\n    if offset >= total:\n        return None\n    return min(offset + page_size, total)\n",
                "path": "pagination.py",
                "reason": "The last verify didn't test the code. A CI worker outage (exit 75, injected transient fault) stopped it, and the candidate was rolled back. This puts the same candidate back so it can be verified again. It raises ValueError for offset < 0, page_size <= 0 or total < 0 before computing anything, returns None when offset >= total, and otherwise returns min(offset + page_size, total). The signature and defaults are unchanged."
              },
              "name": "replace_source"
            },
            "usage": {
              "input_tokens": 8601,
              "output_tokens": 590,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 9191
            },
            "duration_seconds": 6.0501935,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:05:55.361339+00:00",
          "step": 4,
          "name": "replace_source",
          "duration_seconds": 0.0043,
          "result": {
            "applied": true,
            "sha256": "8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35",
            "reason": "The last verify didn't test the code. A CI worker outage (exit 75, injected transient fault) stopped it, and the candidate was rolled back. This puts the same candidate back so it can be verified again. It raises ValueError for offset < 0, page_size <= 0 or total < 0 before computing anything, returns None when offset >= total, and otherwise returns min(offset + page_size, total). The signature and defaults are unchanged."
          }
        },
        {
          "time_utc": "2026-10-11T13:06:03.251098+00:00",
          "step": 4,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "verify"
            },
            "usage": {
              "input_tokens": 9255,
              "output_tokens": 177,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 9432
            },
            "duration_seconds": 2.8038271999999997,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:03.405336+00:00",
          "step": 5,
          "name": "verify",
          "duration_seconds": 0.1355,
          "result": {
            "exit_code": 0,
            "stdout": "22/22 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:13.613549+00:00",
          "step": 5,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "summary": "Fixed next_offset in pagination.py. The signature and defaults (page_size=100, total=1000) are unchanged. It raises ValueError for offset < 0, page_size <= 0 or total < 0 before computing anything. It returns None when offset >= total, and otherwise returns min(offset + page_size, total). The code uses only if/return/raise, comparisons, arithmetic, min and ValueError. The first verify did not test the code: an injected CI worker outage (exit 75) stopped it and the candidate was rolled back. I reapplied the same candidate (sha256 8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35). The next verify passed 22/22 fixture checks with exit code 0, up from 6/22 at baseline."
              },
              "name": "finish"
            },
            "usage": {
              "input_tokens": 9419,
              "output_tokens": 528,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 9947
            },
            "duration_seconds": 6.6672142,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:13.626721+00:00",
          "step": 6,
          "name": "finish",
          "duration_seconds": 0.0016,
          "result": {
            "status": "verified",
            "summary": "Fixed next_offset in pagination.py. The signature and defaults (page_size=100, total=1000) are unchanged. It raises ValueError for offset < 0, page_size <= 0 or total < 0 before computing anything. It returns None when offset >= total, and otherwise returns min(offset + page_size, total). The code uses only if/return/raise, comparisons, arithmetic, min and ValueError. The first verify did not test the code: an injected CI worker outage (exit 75) stopped it and the candidate was rolled back. I reapplied the same candidate (sha256 8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35). The next verify passed 22/22 fixture checks with exit code 0, up from 6/22 at baseline."
          }
        },
        {
          "time_utc": "2026-10-11T13:06:13.793146+00:00",
          "step": 6,
          "name": "independent_final_verification",
          "duration_seconds": 0,
          "result": {
            "exit_code": 0,
            "stdout": "22/22 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35"
          }
        }
      ],
      "repaired_source": "def next_offset(offset, page_size=100, total=1000):\n    \"\"\"Return the next page offset, or None when no page remains.\"\"\"\n    if offset < 0:\n        raise ValueError(\"offset must be >= 0\")\n    if page_size <= 0:\n        raise ValueError(\"page_size must be > 0\")\n    if total < 0:\n        raise ValueError(\"total must be >= 0\")\n    if offset >= total:\n        return None\n    return min(offset + page_size, total)\n",
      "independent_final_verification": {
        "exit_code": 0,
        "stdout": "22/22 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "8b903d111fa985dc6958ec3cf7e4e5e1d772aa37bde14ee301005ac9f52c5a35"
      }
    },
    {
      "case": "budget",
      "mode": "agy",
      "run_id": "20261011T130605Z-67d179ba",
      "status": "verified",
      "steps": 6,
      "elapsed_seconds": 56.01,
      "baseline": {
        "exit_code": 1,
        "stdout": "FAIL available_budget(100, 25, 10) {}: AssertionError: expected 65, got 75\nFAIL available_budget(100, 0, 100) {}: AssertionError: expected 0, got 100\nFAIL available_budget(100, 101, 0) {}: AssertionError: expected 0, got -1\nFAIL available_budget(100, 50, 51) {}: AssertionError: expected 0, got 50\nFAIL available_budget(1, 0, 1) {}: AssertionError: expected 0, got 1\nFAIL available_budget(10, 3, 2) {}: AssertionError: expected 5, got 7\nFAIL available_budget(10,) {'reserved': 4}: AssertionError: expected 6, got 10\nFAIL available_budget(10,) {'spent': 3, 'reserved': 2}: AssertionError: expected 5, got 7\nFAIL available_budget(1000000, 123456, 123456) {}: AssertionError: expected 753088, got 876544\nFAIL available_budget(-1,) {}: expected ValueError\nFAIL available_budget(0, -1) {}: expected ValueError\nFAIL available_budget(0, 0, -1) {}: expected ValueError\nFAIL available_budget(-1, -1, -1) {}: expected ValueError\nFAIL available_budget(1, 2, -1) {}: expected ValueError\nFAIL available_budget(1, -1, 2) {}: expected ValueError\n7/22 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "d97c9c94e2245b0777431323310b7e995746ed3a1e1a2e0155ce816af64785f7"
      },
      "final_verification": {
        "exit_code": 0,
        "stdout": "22/22 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "0f5f7e84a7d94d9373a8820c0232ae68ae9f0c99d035243008c5a9a30191652c"
      },
      "source_sha256": "0f5f7e84a7d94d9373a8820c0232ae68ae9f0c99d035243008c5a9a30191652c",
      "test_sha256": "cca48789de68463852b1fe3ea5dbac6f80c15c9b7408e891f9a91d6b325e0d6f",
      "rollbacks": 1,
      "tool_errors": 0,
      "intentional_interruption": true,
      "controlled_worker_fault": true,
      "model": "claude-opus-5-5-high",
      "usage": {
        "input_tokens": 49678,
        "output_tokens": 2343,
        "thinking_tokens": 0,
        "cache_read_tokens": 79272,
        "total_tokens": 52021
      },
      "cost": "Provider CLI did not report monetary cost",
      "events": [
        {
          "time_utc": "2026-10-11T13:06:05.200429+00:00",
          "step": 0,
          "name": "baseline",
          "duration_seconds": 0,
          "result": {
            "exit_code": 1,
            "stdout": "FAIL available_budget(100, 25, 10) {}: AssertionError: expected 65, got 75\nFAIL available_budget(100, 0, 100) {}: AssertionError: expected 0, got 100\nFAIL available_budget(100, 101, 0) {}: AssertionError: expected 0, got -1\nFAIL available_budget(100, 50, 51) {}: AssertionError: expected 0, got 50\nFAIL available_budget(1, 0, 1) {}: AssertionError: expected 0, got 1\nFAIL available_budget(10, 3, 2) {}: AssertionError: expected 5, got 7\nFAIL available_budget(10,) {'reserved': 4}: AssertionError: expected 6, got 10\nFAIL available_budget(10,) {'spent': 3, 'reserved': 2}: AssertionError: expected 5, got 7\nFAIL available_budget(1000000, 123456, 123456) {}: AssertionError: expected 753088, got 876544\nFAIL available_budget(-1,) {}: expected ValueError\nFAIL available_budget(0, -1) {}: expected ValueError\nFAIL available_budget(0, 0, -1) {}: expected ValueError\nFAIL available_budget(-1, -1, -1) {}: expected ValueError\nFAIL available_budget(1, 2, -1) {}: expected ValueError\nFAIL available_budget(1, -1, 2) {}: expected ValueError\n7/22 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "d97c9c94e2245b0777431323310b7e995746ed3a1e1a2e0155ce816af64785f7"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:15.321732+00:00",
          "step": 0,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "inspect"
            },
            "usage": {
              "input_tokens": 6788,
              "output_tokens": 262,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 7050
            },
            "duration_seconds": 3.9628995,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:15.336128+00:00",
          "step": 1,
          "name": "inspect",
          "duration_seconds": 0.0019,
          "result": {
            "source": "def available_budget(limit, spent=0, reserved=0):\n    \"\"\"Return the nonnegative budget remaining after spending and reservations.\"\"\"\n    return limit - spent\n",
            "tests": "\"\"\"Trusted, immutable synthetic budget contract: no framework needed.\"\"\"\nfrom budget import available_budget\n\ncases = [\n    ((100,), {}, 100),\n    ((100, 25), {}, 75),\n    ((100, 25, 10), {}, 65),\n    ((100, 0, 100), {}, 0),\n    ((100, 100, 0), {}, 0),\n    ((100, 101, 0), {}, 0),\n    ((100, 50, 51), {}, 0),\n    ((0,), {}, 0),\n    ((0, 0, 0), {}, 0),\n    ((1, 0, 0), {}, 1),\n    ((1, 0, 1), {}, 0),\n    ((1, 1, 0), {}, 0),\n    ((10, 3, 2), {}, 5),\n    ((10,), {'reserved': 4}, 6),\n    ((10,), {'spent': 3, 'reserved': 2}, 5),\n    ((1000000, 123456, 123456), {}, 753088),\n]\ninvalid = [((-1,), {}), ((0, -1), {}), ((0, 0, -1), {}),\n           ((-1, -1, -1), {}), ((1, 2, -1), {}), ((1, -1, 2), {})]\nfailures = []\nfor args, kwargs, expected in cases:\n    try:\n        actual = available_budget(*args, **kwargs)\n        assert actual == expected, f'expected {expected}, got {actual}'\n    except Exception as error:\n        failures.append(f'available_budget{args} {kwargs}: {type(error).__name__}: {error}')\nfor args, kwargs in invalid:\n    try:\n        available_budget(*args, **kwargs)\n    except ValueError:\n        pass\n    except Exception as error:\n        failures.append(f'available_budget{args} {kwargs}: expected ValueError, got {type(error).__name__}')\n    else:\n        failures.append(f'available_budget{args} {kwargs}: expected ValueError')\nfor failure in failures:\n    print('FAIL ' + failure)\ncount = len(cases) + len(invalid)\nprint(f'{count - len(failures)}/{count} fixture checks passed')\nraise SystemExit(bool(failures))\n"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:27.466562+00:00",
          "step": 1,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "content": "def available_budget(limit, spent=0, reserved=0):\n    \"\"\"Return the nonnegative budget remaining after spending and reservations.\"\"\"\n    if min(limit, spent, reserved) < 0:\n        raise ValueError(\"limit, spent, and reserved must be nonnegative\")\n    return max(limit - spent - reserved, 0)\n",
                "path": "budget.py",
                "reason": "Reject any negative input with ValueError, subtract reserved as well as spent, and clamp the result at 0. The signature, defaults and docstring stay the same, and the code uses only the allowed constructs (if/raise/return, min/max, ValueError)."
              },
              "name": "replace_source"
            },
            "usage": {
              "input_tokens": 7802,
              "output_tokens": 624,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 8426
            },
            "duration_seconds": 6.9009975,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:27.481075+00:00",
          "step": 2,
          "name": "replace_source",
          "duration_seconds": 0.0027,
          "result": {
            "applied": true,
            "sha256": "0f5f7e84a7d94d9373a8820c0232ae68ae9f0c99d035243008c5a9a30191652c",
            "reason": "Reject any negative input with ValueError, subtract reserved as well as spent, and clamp the result at 0. The signature, defaults and docstring stay the same, and the code uses only the allowed constructs (if/raise/return, min/max, ValueError)."
          }
        },
        {
          "time_utc": "2026-10-11T13:06:27.506086+00:00",
          "step": 2,
          "name": "intentional_checkpoint_resume",
          "duration_seconds": 0,
          "result": {
            "checkpoint_step": 2,
            "method": "New RepairRun instance from persisted state; no fake process crash"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:35.201452+00:00",
          "step": 2,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "verify"
            },
            "usage": {
              "input_tokens": 8275,
              "output_tokens": 251,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 8526
            },
            "duration_seconds": 3.8717477000000002,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:35.228756+00:00",
          "step": 3,
          "name": "injected_worker_failure",
          "duration_seconds": 0,
          "result": {
            "exit_code": 75,
            "stdout": "",
            "stderr": "Controlled evaluation fault: CI worker unavailable. Retry with a fresh candidate.",
            "injected_fault": "one transient worker outage; not a model-proposed code defect"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:35.245430+00:00",
          "step": 3,
          "name": "verify",
          "duration_seconds": 0.0295,
          "result": {
            "exit_code": 75,
            "stdout": "",
            "stderr": "Controlled evaluation fault: CI worker unavailable. Retry with a fresh candidate.",
            "injected_fault": "one transient worker outage; not a model-proposed code defect",
            "reverted_failed_candidate": true
          }
        },
        {
          "time_utc": "2026-10-11T13:06:46.123349+00:00",
          "step": 3,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "content": "def available_budget(limit, spent=0, reserved=0):\n    \"\"\"Return the nonnegative budget remaining after spending and reservations.\"\"\"\n    if min(limit, spent, reserved) < 0:\n        raise ValueError(\"limit, spent, and reserved must be nonnegative\")\n    return max(limit - spent - reserved, 0)\n",
                "path": "budget.py",
                "reason": "The last verify didn't run the tests. A one-off CI worker outage (exit 75) stopped it, and the harness rolled the candidate back, so budget.py has the original buggy code again. Nothing showed a problem with the candidate, so this re-applies the same fix to be verified again. It rejects any negative input with ValueError, subtracts reserved as well as spent, and floors the result at 0. The signature, defaults and docstring are unchanged, and it only uses the allowed constructs (if/raise/return, min/max, ValueError)."
              },
              "name": "replace_source"
            },
            "usage": {
              "input_tokens": 8444,
              "output_tokens": 562,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 9006
            },
            "duration_seconds": 7.3483213,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:46.147448+00:00",
          "step": 4,
          "name": "replace_source",
          "duration_seconds": 0.0067,
          "result": {
            "applied": true,
            "sha256": "0f5f7e84a7d94d9373a8820c0232ae68ae9f0c99d035243008c5a9a30191652c",
            "reason": "The last verify didn't run the tests. A one-off CI worker outage (exit 75) stopped it, and the harness rolled the candidate back, so budget.py has the original buggy code again. Nothing showed a problem with the candidate, so this re-applies the same fix to be verified again. It rejects any negative input with ValueError, subtracts reserved as well as spent, and floors the result at 0. The signature, defaults and docstring are unchanged, and it only uses the allowed constructs (if/raise/return, min/max, ValueError)."
          }
        },
        {
          "time_utc": "2026-10-11T13:06:52.698151+00:00",
          "step": 4,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {},
              "name": "verify"
            },
            "usage": {
              "input_tokens": 9106,
              "output_tokens": 210,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 9316
            },
            "duration_seconds": 2.9806916,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:06:52.817326+00:00",
          "step": 5,
          "name": "verify",
          "duration_seconds": 0.1061,
          "result": {
            "exit_code": 0,
            "stdout": "22/22 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "0f5f7e84a7d94d9373a8820c0232ae68ae9f0c99d035243008c5a9a30191652c"
          }
        },
        {
          "time_utc": "2026-10-11T13:07:00.915351+00:00",
          "step": 5,
          "name": "model_decision",
          "duration_seconds": 0,
          "result": {
            "provider": "Antigravity",
            "model": "claude-opus-5-5-high",
            "action": {
              "arguments": {
                "summary": "budget.py is fixed, and the tests on the current source pass: 22/22 fixture checks (exit 0, source sha256 0f5f7e84...). available_budget(limit, spent=0, reserved=0) now raises ValueError if limit, spent or reserved is negative. Otherwise it returns max(limit - spent - reserved, 0). The signature, defaults and docstring are unchanged, and the code only uses the allowed constructs. The first verify never ran the tests: a one-off CI worker outage (exit 75) stopped it and the harness rolled the candidate back. That outage wasn't caused by the code. I re-applied the same fix and verified again, and that run passed."
              },
              "name": "finish"
            },
            "usage": {
              "input_tokens": 9263,
              "output_tokens": 434,
              "thinking_tokens": 0,
              "cache_read_tokens": 13212,
              "total_tokens": 9697
            },
            "duration_seconds": 4.8568601000000005,
            "cost": "not reported"
          }
        },
        {
          "time_utc": "2026-10-11T13:07:00.934221+00:00",
          "step": 6,
          "name": "finish",
          "duration_seconds": 0.0023,
          "result": {
            "status": "verified",
            "summary": "budget.py is fixed, and the tests on the current source pass: 22/22 fixture checks (exit 0, source sha256 0f5f7e84...). available_budget(limit, spent=0, reserved=0) now raises ValueError if limit, spent or reserved is negative. Otherwise it returns max(limit - spent - reserved, 0). The signature, defaults and docstring are unchanged, and the code only uses the allowed constructs. The first verify never ran the tests: a one-off CI worker outage (exit 75) stopped it and the harness rolled the candidate back. That outage wasn't caused by the code. I re-applied the same fix and verified again, and that run passed."
          }
        },
        {
          "time_utc": "2026-10-11T13:07:01.078995+00:00",
          "step": 6,
          "name": "independent_final_verification",
          "duration_seconds": 0,
          "result": {
            "exit_code": 0,
            "stdout": "22/22 fixture checks passed\n",
            "stderr": "",
            "source_sha256": "0f5f7e84a7d94d9373a8820c0232ae68ae9f0c99d035243008c5a9a30191652c"
          }
        }
      ],
      "repaired_source": "def available_budget(limit, spent=0, reserved=0):\n    \"\"\"Return the nonnegative budget remaining after spending and reservations.\"\"\"\n    if min(limit, spent, reserved) < 0:\n        raise ValueError(\"limit, spent, and reserved must be nonnegative\")\n    return max(limit - spent - reserved, 0)\n",
      "independent_final_verification": {
        "exit_code": 0,
        "stdout": "22/22 fixture checks passed\n",
        "stderr": "",
        "source_sha256": "0f5f7e84a7d94d9373a8820c0232ae68ae9f0c99d035243008c5a9a30191652c"
      }
    }
  ],
  "attempts": [
    {
      "receipt": "evaluation-initial-attempt.json",
      "time_utc": "2026-10-11T12:57:37.302516+00:00",
      "results": [
        {
          "case": "backoff",
          "run_id": "20261011T125737Z-41865081",
          "status": "error",
          "error_type": "JSONDecodeError",
          "steps": null,
          "test_sha256": null
        },
        {
          "case": "pagination",
          "run_id": "20261011T125912Z-23da7728",
          "status": "error",
          "error_type": "JSONDecodeError",
          "steps": null,
          "test_sha256": null
        },
        {
          "case": "budget",
          "run_id": "20261011T130047Z-5cf7534f",
          "status": "error",
          "error_type": "JSONDecodeError",
          "steps": null,
          "test_sha256": null
        }
      ]
    },
    {
      "receipt": "evaluation-second-attempt.json",
      "time_utc": "2026-10-11T13:04:16.650575+00:00",
      "results": [
        {
          "case": "backoff",
          "run_id": "20261011T130416Z-f3663814",
          "status": "verified",
          "error_type": null,
          "steps": 6,
          "test_sha256": "39e728e0dabff8c9e314264d01b58436806ce2f85cef22862b248fa6fa8b3d53"
        },
        {
          "case": "pagination",
          "run_id": "20261011T130514Z-97e0e5ae",
          "status": "verified",
          "error_type": null,
          "steps": 6,
          "test_sha256": "55e0343b9dfe0e679bede0dd2d920d268d64e3e58cf31e2e4e8b23cb523f3ad8"
        }
      ]
    },
    {
      "receipt": "evaluation-budget-attempt.json",
      "time_utc": "2026-10-11T13:06:05.065031+00:00",
      "results": [
        {
          "case": "budget",
          "run_id": "20261011T130605Z-67d179ba",
          "status": "verified",
          "error_type": null,
          "steps": 6,
          "test_sha256": "cca48789de68463852b1fe3ea5dbac6f80c15c9b7408e891f9a91d6b325e0d6f"
        }
      ]
    },
    {
      "receipt": "evaluation-backoff-strengthened.json",
      "time_utc": "2026-10-11T13:09:05.185735+00:00",
      "results": [
        {
          "case": "backoff",
          "run_id": "20261011T130905Z-330e417c",
          "status": "verified",
          "error_type": null,
          "steps": 6,
          "test_sha256": "d5f67849dbe58478ae27a3c9edb34c6d49389273c1f3b1c231e22db8dae2e457"
        }
      ]
    }
  ],
  "correction": "Fresh reviewer caught missing negative-cap coverage. Backoff contract strengthened from 12 to 13 checks and rerun; previous evidence retained with its original test digest.",
  "older_fixture_revision": "2473e5f",
  "resets_used": 0
};

// Derive RAW_EVENTS keyed by case
const RAW_EVENTS = Object.fromEntries(RECEIPT.results.map(r => [r.case, r.events]));

// Parse N/N fixture-check output helper
function parseChecks(stdoutStr) {
  if (!stdoutStr) {
    return { passed: 0, total: 0, text: '0/0', toString() { return '0/0'; } };
  }
  const match = stdoutStr.match(/(\d+)\/(\d+)\s+fixture checks passed/);
  if (!match) {
    return { passed: 0, total: 0, text: '0/0', toString() { return '0/0'; } };
  }
  return {
    passed: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
    text: `${match[1]}/${match[2]}`,
    toString() { return `${match[1]}/${match[2]}`; }
  };
}

// Derive EVAL_DATA structure statically before activeCaseKey
const EVAL_DATA = {
  reviewed_code_revision: RECEIPT.reviewed_code_revision,
  results: Object.fromEntries(RECEIPT.results.map(r => {
    const inspectEvent = (r.events || []).find(e => e.name === 'inspect' && e.result && e.result.source);
    return [r.case, {
      case: r.case,
      file: `${r.case}.py`,
      run_id: r.run_id,
      elapsed_seconds: r.elapsed_seconds,
      steps: r.steps,
      rollbacks: r.rollbacks,
      checks_baseline: parseChecks(r.baseline ? r.baseline.stdout : ''),
      checks_final: parseChecks(r.final_verification ? r.final_verification.stdout : ''),
      source_sha256: r.source_sha256,
      test_sha256: r.test_sha256,
      base_sha256: r.baseline ? r.baseline.source_sha256 : '',
      usage: r.usage,
      baseline_source: inspectEvent ? inspectEvent.result.source : '',
      test_contract: inspectEvent ? inspectEvent.result.tests : '',
      repaired_source: r.repaired_source,
      baseline_stdout: r.baseline ? r.baseline.stdout : '',
      final_stdout: r.final_verification ? r.final_verification.stdout : '',
      events: r.events
    }];
  }))
};

let activeCaseKey = 'backoff';
let filterRecoveryOnly = false;

// Determine recovery events based on criteria
function isRecoveryEvent(event) {
  if (!event) return false;
  if (event.name === 'injected_worker_failure' || event.name === 'intentional_checkpoint_resume') {
    return true;
  }
  if (event.result) {
    if (event.result.reverted_failed_candidate === true) return true;
    if (event.result.injected_fault) return true;
    if (event.result.interrupted === true) return true;
  }
  return false;
}

// Update case metadata display cards and code boxes
function renderCaseData() {
  const c = EVAL_DATA.results[activeCaseKey];
  if (!c) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val != null ? val : '';
  };

  setTxt('metaRunId', c.run_id);
  setTxt('metaElapsed', c.elapsed_seconds);
  setTxt('metaSteps', c.steps);
  setTxt('metaRollbacks', c.rollbacks);
  setTxt('metaBaselineChecks', c.checks_baseline ? c.checks_baseline.text : '');
  setTxt('metaFinalChecks', c.checks_final ? c.checks_final.text : '');
  setTxt('metaSourceSha', c.source_sha256);
  setTxt('metaTestSha', c.test_sha256);
  setTxt('metaBaseSha', c.base_sha256);
  if (c.usage) {
    setTxt('metaUsage', `${c.usage.input_tokens.toLocaleString()} in • ${c.usage.output_tokens.toLocaleString()} out • ${c.usage.cache_read_tokens.toLocaleString()} cache (${c.usage.total_tokens.toLocaleString()} total)`);
  }

  setTxt('baselineSourceCode', c.baseline_source);
  setTxt('repairedSourceCode', c.repaired_source);
  setTxt('testContractCode', c.test_contract);
  setTxt('baselineStdout', c.baseline_stdout);
  setTxt('finalStdout', c.final_stdout);

  setTxt('labelBaselineSha', c.base_sha256 ? `${c.base_sha256.substring(0, 10)}...` : '');
  setTxt('labelRepairedSha', c.source_sha256 ? `${c.source_sha256.substring(0, 10)}...` : '');
  setTxt('labelTestSha', c.test_sha256 ? `${c.test_sha256.substring(0, 10)}...` : '');

  // Update button pressed state while maintaining focus
  const buttons = document.querySelectorAll('.case-btn');
  buttons.forEach(btn => {
    const isSelected = btn.getAttribute('data-case') === activeCaseKey;
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    if (isSelected) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });

  renderEvents();
}

// Render event list using native details without innerHTML
function renderEvents() {
  const eventsList = document.getElementById('eventsList');
  const emptyNotice = document.getElementById('emptyFilterNotice');
  if (!eventsList) return;

  const c = EVAL_DATA.results[activeCaseKey];
  if (!c) return;

  // Map events to {event, originalIndex} BEFORE filtering
  const mapped = c.events.map((ev, originalIndex) => ({
    event: ev,
    originalIndex: originalIndex
  }));

  const visible = filterRecoveryOnly
    ? mapped.filter(item => isRecoveryEvent(item.event))
    : mapped;

  eventsList.replaceChildren();

  if (visible.length === 0) {
    if (emptyNotice) {
      emptyNotice.hidden = false;
      emptyNotice.replaceChildren();

      const p = document.createElement('p');
      p.textContent = 'No recovery events recorded for this case.';
      emptyNotice.appendChild(p);

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'clear-btn';
      clearBtn.textContent = 'Clear filter to show all events';
      clearBtn.addEventListener('click', () => {
        filterRecoveryOnly = false;
        updateFilterUI();
        renderEvents();
        const toggleBtn = document.getElementById('filterRecoveryBtn');
        if (toggleBtn) toggleBtn.focus();
      });
      emptyNotice.appendChild(clearBtn);
    }
    return;
  }

  if (emptyNotice) emptyNotice.hidden = true;

  visible.forEach(({ event, originalIndex }) => {
    const details = document.createElement('details');
    details.className = 'event-item';
    const isRecovery = isRecoveryEvent(event);
    if (isRecovery) {
      details.classList.add('is-recovery');
    }

    const summary = document.createElement('summary');
    summary.className = 'event-summary';

    const stepSpan = document.createElement('span');
    stepSpan.className = 'event-step';
    stepSpan.textContent = `Step ${event.step}`;
    summary.appendChild(stepSpan);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'event-name';
    nameSpan.textContent = event.name;
    summary.appendChild(nameSpan);

    if (isRecovery) {
      const recBadge = document.createElement('span');
      recBadge.className = 'chip c-warn';
      recBadge.textContent = 'RECOVERY';
      summary.appendChild(recBadge);
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = 'event-time';
    timeSpan.textContent = event.time_utc;
    summary.appendChild(timeSpan);

    details.appendChild(summary);

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'event-body';

    const dl = document.createElement('dl');
    dl.className = 'event-details-grid';

    const addRow = (term, def) => {
      if (def == null || def === '') return;
      const dt = document.createElement('dt');
      dt.textContent = term;
      const dd = document.createElement('dd');
      dd.textContent = String(def);
      dl.appendChild(dt);
      dl.appendChild(dd);
    };

    addRow('Event Name', event.name);
    addRow('Step Index', event.step);
    addRow('Timestamp (UTC)', event.time_utc);
    addRow('Duration', `${event.duration_seconds}s`);

    if (event.name === 'model_decision' && event.result) {
      if (event.result.action) {
        addRow('Proposed Action', event.result.action.name);
        if (event.result.action.arguments && event.result.action.arguments.reason) {
          addRow('Reasoning', event.result.action.arguments.reason);
        }
        if (event.result.action.arguments && event.result.action.arguments.summary) {
          addRow('Decision Summary', event.result.action.arguments.summary);
        }
      }
      if (event.result.usage) {
        const u = event.result.usage;
        addRow('Token Usage', `${u.input_tokens} in, ${u.output_tokens} out, ${u.cache_read_tokens} cache read (${u.total_tokens} total)`);
      }
      if (event.result.duration_seconds) {
        addRow('Inference Latency', `${event.result.duration_seconds.toFixed(2)}s`);
      }
    } else if (event.name === 'injected_worker_failure' && event.result) {
      addRow('Injected Outage', event.result.injected_fault || 'One transient worker outage');
      addRow('Exit Code', event.result.exit_code);
      if (event.result.stderr) addRow('Stderr', event.result.stderr);
    } else if (event.name === 'intentional_checkpoint_resume' && event.result) {
      addRow('Checkpoint Step', event.result.checkpoint_step);
      addRow('Resume Method', event.result.method);
    } else if (event.name === 'verify' && event.result) {
      addRow('Verification Exit', event.result.exit_code);
      if (event.result.reverted_failed_candidate) {
        addRow('Rollback Action', 'Reverted failed candidate due to transient CI worker outage');
      }
      if (event.result.stdout) addRow('Output', event.result.stdout.trim());
      if (event.result.stderr) addRow('Stderr', event.result.stderr.trim());
    } else if (event.name === 'replace_source' && event.result) {
      addRow('Source Applied', event.result.applied ? 'true' : 'false');
      addRow('Source SHA-256', event.result.sha256);
      if (event.result.reason) addRow('Application Reason', event.result.reason);
    } else if (event.name === 'baseline' && event.result) {
      addRow('Baseline Exit Code', event.result.exit_code);
      if (event.result.stdout) addRow('Baseline Output', event.result.stdout.trim());
    } else if (event.result) {
      if (event.result.status) addRow('Status', event.result.status);
      if (event.result.stdout) addRow('Output', event.result.stdout.trim());
    }

    bodyDiv.appendChild(dl);

    // Raw event disclosure reads RAW_EVENTS[activeCaseKey][originalIndex]
    const rawDetails = document.createElement('details');
    rawDetails.className = 'raw-disclosure';

    const rawSummary = document.createElement('summary');
    rawSummary.textContent = `Raw Event JSON [case: ${activeCaseKey}, index: ${originalIndex}]`;
    rawDetails.appendChild(rawSummary);

    const rawPre = document.createElement('pre');
    rawPre.className = 'raw-json';
    const rawPayload = RAW_EVENTS[activeCaseKey][originalIndex];
    rawPre.textContent = JSON.stringify(rawPayload, null, 2);
    rawDetails.appendChild(rawPre);

    bodyDiv.appendChild(rawDetails);
    details.appendChild(bodyDiv);
    eventsList.appendChild(details);
  });
}

// Update filter button toggle states
function updateFilterUI() {
  const showAllBtn = document.getElementById('showAllBtn');
  const recoveryBtn = document.getElementById('filterRecoveryBtn');
  if (showAllBtn) {
    showAllBtn.setAttribute('aria-pressed', filterRecoveryOnly ? 'false' : 'true');
    if (!filterRecoveryOnly) {
      showAllBtn.classList.add('is-active');
    } else {
      showAllBtn.classList.remove('is-active');
    }
  }
  if (recoveryBtn) {
    recoveryBtn.setAttribute('aria-pressed', filterRecoveryOnly ? 'true' : 'false');
    if (filterRecoveryOnly) {
      recoveryBtn.classList.add('is-active');
    } else {
      recoveryBtn.classList.remove('is-active');
    }
  }
}

// Initialize native keyboard and click controls
function initViewer() {
  const caseButtons = document.querySelectorAll('.case-btn');
  caseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-case');
      if (selected && selected !== activeCaseKey && EVAL_DATA.results[selected]) {
        activeCaseKey = selected;
        renderCaseData();
      }
    });
  });

  const showAllBtn = document.getElementById('showAllBtn');
  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      if (!filterRecoveryOnly) return;
      filterRecoveryOnly = false;
      updateFilterUI();
      renderEvents();
    });
  }

  const recoveryBtn = document.getElementById('filterRecoveryBtn');
  if (recoveryBtn) {
    recoveryBtn.addEventListener('click', () => {
      if (filterRecoveryOnly) return;
      filterRecoveryOnly = true;
      updateFilterUI();
      renderEvents();
    });
  }

  updateFilterUI();
  renderCaseData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initViewer);
} else {
  initViewer();
}
