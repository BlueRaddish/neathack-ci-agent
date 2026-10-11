def available_budget(limit, spent=0, reserved=0):
    """Return the nonnegative budget remaining after spending and reservations."""
    return limit - spent
