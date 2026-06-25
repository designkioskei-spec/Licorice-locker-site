"""Storefront feature flags — flip to re-enable archived products.

Soundwave Disabled: set SOUNDWAVE_ENABLED = True to restore Sound Wave everywhere.
"""

from __future__ import annotations

# —— Soundwave Disabled (temporary freeze; all code/assets preserved) ——
SOUNDWAVE_ENABLED = False
SOUNDWAVE_SLUG = "sound-wave"


def is_soundwave_slug(slug: str | None) -> bool:
    return (slug or "").strip().lower() == SOUNDWAVE_SLUG


def storefront_product_visible(slug: str | None) -> bool:
    if SOUNDWAVE_ENABLED:
        return True
    return not is_soundwave_slug(slug)
