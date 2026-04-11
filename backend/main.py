import asyncio
import threading
import sys
import requests
import json
import re
import os
from html import unescape
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

SOURCES = {
    "genshin": "https://genshin-builds.com/en/timeline",
    "hsr": "https://www.prydwen.gg/star-rail/",
    "zzz": "https://zzz.rng.moe/en/timeline",
    "wuwa": "https://wuwatracker.com/timeline",
}

def fetch_with_playwright(url: str) -> str:
    """Run Playwright in a separate thread with its own event loop to avoid Windows asyncio issues."""
    result = {}

    def run():
        async def _fetch():
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    await page.wait_for_timeout(10000)
                    content = await page.content()
                finally:
                    await browser.close()
                return content

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result["content"] = loop.run_until_complete(_fetch())
        except Exception as e:
            result["error"] = e
        finally:
            loop.close()

    thread = threading.Thread(target=run)
    thread.start()
    thread.join()

    if "error" in result:
        raise result["error"]
    return result["content"]

def evaluate_with_playwright(url: str, js: str):
    """Run a JS expression on a rendered page and return the result directly."""
    result = {}

    def run():
        async def _evaluate():
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                try:
                    await page.goto(url, wait_until="networkidle", timeout=60000)
                    await page.wait_for_timeout(10000)
                    data = await page.evaluate(js)
                finally:
                    await browser.close()
                return data

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result["data"] = loop.run_until_complete(_evaluate())
        except Exception as e:
            result["error"] = e
        finally:
            loop.close()

    thread = threading.Thread(target=run)
    thread.start()
    thread.join()

    if "error" in result:
        raise result["error"]
    return result["data"]

def parse_events(html: str, game_id: str):
    if game_id == "genshin":
        return parse_genshin(html, game_id)
    elif game_id == "zzz":
        return parse_zzz(html, game_id)
    return []

def parse_genshin(html: str, game_id: str):
    soup = BeautifulSoup(html, "html.parser")
    island = soup.find("astro-island", attrs={"component-url": re.compile("TimelineChart")})
    
    if not island:
        return []

    props_raw = unescape(island.get("props", "{}"))
    props = json.loads(props_raw)

    tracks = props.get("tracks", [1, []])[1]
    
    events = []
    seen = set()
    now = datetime.utcnow()

    for track in tracks:
        for item in track[1]:
            event = item[1]
            name = event.get("name", [0, ""])[1]
            start = event.get("start", [0, ""])[1]
            end = event.get("end", [0, ""])[1]
            url = event.get("url", [0, ""])[1]

            if not name or not start or not end:
                continue

            try:
                end_dt = datetime.strptime(end, "%Y-%m-%d %H:%M:%S")
                start_dt = datetime.strptime(start, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                continue

            if end_dt < now:
                continue

            key = f"{name}_{start}"
            if key in seen:
                continue
            seen.add(key)

            events.append({
                "id": f"{game_id}_{key}",
                "title": name,
                "game": game_id,
                "start": start_dt.isoformat(),
                "end": end_dt.isoformat(),
                "url": url,
                "type": "banner" if "banner" in name.lower() else "event",
            })

    return events

def parse_hsr(data: list, game_id: str):
    events = []
    seen = set()
    now = datetime.utcnow()

    for item in data:
        name = item.get("name")
        duration = item.get("duration")

        if not name or not duration:
            continue

        # Normalize dash types and extract date range
        duration = duration.replace("–", "-").replace("\u2013", "-")

        # Extract the date portion after "Event Duration: "
        duration = re.sub(r"Event Duration:\s*", "", duration)
        duration = re.sub(r"\s*\(server time\)", "", duration).strip()

        # Split on dash — but carefully since dates contain slashes not dashes
        # We split on " - " with spaces to avoid splitting within dates
        parts = re.split(r"\s+-\s+", duration)
        if len(parts) != 2:
            continue

        start_str, end_str = parts[0].strip(), parts[1].strip()

        if "unknown" in end_str.lower():
            continue

        # Use now as fallback for unknown/maintenance start dates
        if "unknown" in start_str.lower() or "maintenance" in start_str.lower():
            start_dt = now
        else:
            start_dt = try_parse(start_str)
            if not start_dt:
                continue

        end_dt = try_parse(end_str)
        if not end_dt:
            continue

        # Try parsing dates — handle both formats
        def try_parse(s):
            for fmt in ("%Y/%m/%d %H:%M:%S", "%Y/%m/%d %H:%M"):
                try:
                    return datetime.strptime(s, fmt)
                except ValueError:
                    continue
            return None

        start_dt = try_parse(start_str)
        end_dt = try_parse(end_str)

        if not start_dt or not end_dt:
            continue

        if end_dt < now:
            continue

        key = f"{name}_{start_str}"
        if key in seen:
            continue
        seen.add(key)

        events.append({
            "id": f"{game_id}_{key}",
            "title": name,
            "game": game_id,
            "start": start_dt.isoformat(),
            "end": end_dt.isoformat(),
            "url": SOURCES[game_id],
            "type": "banner" if any(w in name.lower() for w in ["warp", "banner", "contender", "excalibur"]) else "event",
        })

    return events

def parse_zzz(html: str, game_id: str):
    import unicodedata
    soup = BeautifulSoup(html, "html.parser")

    # Find the current-time marker position (rem) from the live clock div
    # It looks like: style="left: 169.389rem; transform: translateX(-50%);"
    time_marker = soup.find("div", style=re.compile(r"left:.*rem.*translateX\(-50%\)"))
    if not time_marker:
        return []

    marker_left_match = re.search(r"left:\s*([\d.]+)rem", time_marker.get("style", ""))
    if not marker_left_match:
        return []
    marker_left = float(marker_left_match.group(1))

    now = datetime.utcnow()
    events = []
    seen = set()

    # Each event bar has both left and width in its style
    for bar in soup.find_all("div", style=re.compile(r"left:.*rem.*width:.*rem")):
        style = bar.get("style", "")
        left_match = re.search(r"left:\s*([\d.]+)rem", style)
        width_match = re.search(r"width:\s*([\d.]+)rem", style)
        if not left_match or not width_match:
            continue

        left = float(left_match.group(1))
        width = float(width_match.group(1))

        # 2rem = 1 day, so convert to seconds
        start_offset_days = (left - marker_left) / 2
        duration_days = width / 2
        start_dt = now + timedelta(days=start_offset_days)
        end_dt = start_dt + timedelta(days=duration_days)

        # Skip already-ended events
        if end_dt < now:
            continue

        # Extract event name — strip zero-width unicode chars
        name_span = bar.find("span", style=re.compile(r"text-shadow"))
        if not name_span:
            continue
        raw_name = name_span.get_text()
        name = re.sub(r'[\u200b-\u200f\u2060-\u206f\ufeff\u00ad]', '', raw_name).strip()
        # Also collapse internal whitespace artifacts
        name = re.sub(r'\s+', ' ', name).strip()

        if not name:
            continue

        key = f"{name}_{round(left, 2)}"
        if key in seen:
            continue
        seen.add(key)

        events.append({
            "id": f"{game_id}_{key}",
            "title": name,
            "game": game_id,
            "start": start_dt.isoformat(),
            "end": end_dt.isoformat(),
            "url": SOURCES[game_id],
            "type": "banner" if any(w in name.lower() for w in ["signal", "banner", "invitation", "visitor"]) else "event",
        })

    return events

# Simple in-memory cache: { game_id: { "events": [...], "fetched_at": datetime } }
cache: dict = {}
CACHE_TTL_MINUTES = 30

def get_cached(game_id: str):
    if game_id in cache:
        age = datetime.utcnow() - cache[game_id]["fetched_at"]
        if age < timedelta(minutes=CACHE_TTL_MINUTES):
            return cache[game_id]["events"]
    return None

def set_cached(game_id: str, events: list):
    cache[game_id] = {"events": events, "fetched_at": datetime.utcnow()}

@app.get("/")
def read_root():
    return {"status": "GachaLife API is running"}

HSR_JS = """
() => {
    const items = document.querySelectorAll('.event-tracker .accordion-item')
    return Array.from(items).map(item => ({
        name: item.querySelector('.event-name')?.innerText?.trim(),
        duration: item.querySelector('.duration')?.innerText?.trim(),
        countdown: item.querySelector('.countdown')?.innerText?.trim()
    }))
}
"""

@app.get("/events/{game_id}")
async def get_events(game_id: str):
    if game_id not in SOURCES:
        raise HTTPException(status_code=404, detail=f"Game '{game_id}' not supported")

    cached = get_cached(game_id)
    if cached is not None:
        return {"game_id": game_id, "count": len(cached), "events": cached, "cached": True}

    try:
        if game_id == "hsr":
            raw = evaluate_with_playwright(SOURCES[game_id], HSR_JS)
            events = parse_hsr(raw, game_id)
        else:
            html = fetch_with_playwright(SOURCES[game_id])
            events = parse_events(html, game_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch events: {str(e)}")

    set_cached(game_id, events)
    return {"game_id": game_id, "count": len(events), "events": events, "cached": False}

@app.get("/debug/html/{game_id}")
async def debug_html(game_id: str):
    if game_id not in SOURCES:
        raise HTTPException(status_code=404, detail="Game not supported")
    try:
        html = fetch_with_playwright(SOURCES[game_id])
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    # Grab from 3/4 into the document where actual HTML content should be
    quarter = len(html) * 3 // 4
    return {
        "length": len(html),
        "sample": html[quarter:quarter + 5000]
    }

@app.get("/debug/js/hsr")
async def debug_js_hsr():
    try:
        data = evaluate_with_playwright(
            SOURCES["hsr"],
            """
            () => {
                const items = document.querySelectorAll('.event-tracker .accordion-item')
                return Array.from(items).map(item => ({
                    name: item.querySelector('.event-name')?.innerText?.trim(),
                    duration: item.querySelector('.duration')?.innerText?.trim(),
                    countdown: item.querySelector('.countdown')?.innerText?.trim()
                }))
            }
            """
        )
        return {"count": len(data), "events": data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/status")
def get_status():
    status = {}
    for game_id in SOURCES:
        if game_id in cache:
            status[game_id] = {
                "last_updated": cache[game_id]["fetched_at"].isoformat(),
                "event_count": len(cache[game_id]["events"]),
                "cached": True,
            }
        else:
            status[game_id] = {
                "last_updated": None,
                "event_count": None,
                "cached": False,
            }
    return status