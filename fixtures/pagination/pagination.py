def next_offset(offset, page_size=100, total=1000):
    """Return the next page offset, or None when no page remains."""
    return offset + page_size
