import time
from typing import Any

import requests
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

OPEN_BREWERY_API = "https://api.openbrewerydb.org/v1/breweries"
CACHE_TTL_SECONDS = 300
_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}


def _normalize_brewery(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": item.get("id"),
        "name": item.get("name") or "Unknown brewery",
        "brewery_type": item.get("brewery_type") or "unknown",
        "city": item.get("city") or "Unknown city",
        "state": item.get("state") or "Unknown state",
        "country": item.get("country") or "Unknown country",
        "website_url": item.get("website_url") or "",
        "address_1": item.get("address_1") or "",
        "phone": item.get("phone") or "",
    }


def _fetch_from_open_brewery(query: str) -> list[dict[str, Any]]:
    params = {"query": query, "per_page": 20}
    response = requests.get(f"{OPEN_BREWERY_API}/search", params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()
    return [_normalize_brewery(item) for item in payload]


def _get_cached_results(query: str) -> list[dict[str, Any]] | None:
    cached = _cache.get(query)
    if cached is None:
        return None

    expires_at, results = cached
    if time.monotonic() >= expires_at:
        _cache.pop(query, None)
        return None

    return results


def _store_results(query: str, results: list[dict[str, Any]]) -> None:
    _cache[query] = (time.monotonic() + CACHE_TTL_SECONDS, results)


@require_http_methods(["GET"])
def health_check(request):
    return JsonResponse({"status": "ok", "service": "django-brewery-api"})


@require_http_methods(["GET"])
def search_breweries(request):
    query = (request.GET.get("q") or "").strip()
    if not query:
        return JsonResponse({"results": [], "query": "", "cached": False})

    cached = _get_cached_results(query)
    if cached is not None:
        return JsonResponse({"results": cached, "query": query, "cached": True})

    try:
        results = _fetch_from_open_brewery(query)
    except requests.RequestException:
        return JsonResponse({"results": [], "query": query, "cached": False, "error": "Unable to fetch breweries at this time."}, status=502)

    _store_results(query, results)
    return JsonResponse({"results": results, "query": query, "cached": False})
