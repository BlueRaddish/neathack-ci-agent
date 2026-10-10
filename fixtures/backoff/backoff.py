def retry_delay(attempt, base=1, cap=30):
    """Return the bounded delay for a zero-based retry attempt."""
    return base * 2 ** attempt
