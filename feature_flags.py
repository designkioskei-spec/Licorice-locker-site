"""Storefront feature flags — flip to temporarily freeze archived products.

Set SOUNDWAVE_ENABLED = False to hide Sound Wave everywhere (code/assets preserved).
"""

from __future__ import annotations

# —— Soundwave (set False to temporarily freeze storefront visibility) ——
SOUNDWAVE_ENABLED = True
SOUNDWAVE_SLUG = "sound-wave"


def is_soundwave_slug(slug: str | None) -> bool:
    return (slug or "").strip().lower() == SOUNDWAVE_SLUG


def storefront_product_visible(slug: str | None) -> bool:
    if SOUNDWAVE_ENABLED:
        return True
    return not is_soundwave_slug(slug)
