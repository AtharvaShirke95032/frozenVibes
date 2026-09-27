#!/usr/bin/env python3
"""Extract content and original-resolution photos from the legacy frozenvibes.in WordPress site.

Usage: python3 scripts/extract.py   (rerunnable; existing downloads are skipped)
Outputs to source/content and source/images.
"""
import csv
import html
import json
import re
import struct
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlparse, unquote

BASE = "https://frozenvibes.in"
ROOT = Path(__file__).resolve().parent.parent / "source"
CONTENT = ROOT / "content"
IMAGES = ROOT / "images"
UA = {"User-Agent": "Mozilla/5.0 (frozenvibes-redesign-extractor)"}

IMG_RE = re.compile(r"https?://frozenvibes\.in/wp-content/(?:uploads|gallery)/[^\"'\s)?,<>]+\.(?:jpe?g|png|webp|gif)", re.I)
SIZE_RE = re.compile(r"-\d+x\d+(?=\.\w+$)")


def get(url: str, tries: int = 6) -> bytes:
    """GET with backoff — the Hostinger CDN answers 429 when hit too quickly."""
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            time.sleep(0.4)
            return data
        except urllib.error.HTTPError as e:
            if e.code not in (429, 502, 503, 504) or attempt == tries - 1:
                raise
            wait = int(e.headers.get("Retry-After") or 0) or 5 * 2 ** attempt
            time.sleep(min(wait, 90))


def get_json(url: str):
    return json.loads(get(url))


def text_of(fragment: str) -> str:
    """Rough HTML -> readable text, keeping block breaks."""
    s = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", "", fragment)
    s = re.sub(r"(?i)<h([1-6])[^>]*>", lambda m: "\n\n" + "#" * int(m.group(1)) + " ", s)
    s = re.sub(r"(?i)<br\s*/?>", "\n", s)
    s = re.sub(r"(?i)</(p|div|h[1-6]|li|figure|section|blockquote)>", "\n\n", s)
    s = re.sub(r"(?i)<li[^>]*>", "- ", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t\xa0]+", " ", s)
    s = re.sub(r"\n\s*\n\s*(\n\s*)+", "\n\n", s)
    return "\n".join(line.strip() for line in s.strip().splitlines())


# ---------------------------------------------------------------- media library
def fetch_media():
    out, page = [], 1
    while True:
        batch = get_json(f"{BASE}/wp-json/wp/v2/media?per_page=100&page={page}")
        out += batch
        if len(batch) < 100:
            return out
        page += 1


def original_path(url: str) -> str:
    """Path of the full-size file behind any WP / NextGEN derivative URL (case preserved)."""
    p = urlparse(url).path
    if "/wp-content/gallery/" in p:
        p = re.sub(r"/thumbs/thumbs[-_]", "/", p)
        return re.sub(r"/cache/([^/]+?\.(?:jpe?g|png))-.*$", r"/\1", p, flags=re.I)
    return SIZE_RE.sub("", p)


def canonical_key(url: str) -> str:
    """Identity of a photo regardless of which derivative the URL points to."""
    return original_path(url).replace("-scaled.", ".").lower()


def original_url(url: str, library: dict) -> str:
    return library.get(canonical_key(url)) or BASE + original_path(url)


# ---------------------------------------------------------------- page scraping
def rendered_pages(slug_link: str) -> list[str]:
    """Live HTML for a page, following NextGEN gallery pagination."""
    first = get(slug_link).decode("utf-8", "replace")
    pages = [first]
    nums = [int(n) for n in re.findall(r"nggallery/page/(\d+)", first)]
    for n in range(2, max(nums, default=1) + 1):
        pages.append(get(f"{slug_link.rstrip('/')}/nggallery/page/{n}").decode("utf-8", "replace"))
    return pages


def ordered_unique(seq):
    seen, out = set(), []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def is_complete(b: bytes) -> bool:
    if b[:2] == b"\xff\xd8":
        return b"\xff\xd9" in b[-64:]
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return b"IEND" in b[-16:]
    return len(b) > 0


def image_dims(path: Path):
    b = path.read_bytes()[:256 * 1024]
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", b[16:24])
    if b[:2] == b"\xff\xd8":
        i = 2
        while i < len(b) - 9:
            if b[i] != 0xFF:
                i += 1
                continue
            marker = b[i + 1]
            if marker in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">HH", b[i + 5:i + 9])
                return w, h
            i += 2 + struct.unpack(">H", b[i + 2:i + 4])[0]
    return None, None


def main():
    CONTENT.mkdir(parents=True, exist_ok=True)
    (CONTENT / "pages").mkdir(exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)

    print("media library…")
    media = fetch_media()
    (CONTENT / "media.json").write_text(json.dumps(media, indent=2))
    library = {canonical_key(m["source_url"]): m["source_url"] for m in media}

    print("pages…")
    pages = get_json(f"{BASE}/wp-json/wp/v2/pages?per_page=100")
    pages = [{"slug": "home", "link": BASE + "/", "title": {"rendered": "Home"}, "content": {"rendered": ""}, "parent": 0}] + pages

    usage: dict[str, list[str]] = {}   # original url -> folder names (first = primary)
    order: dict[str, list[str]] = {}   # folder -> ordered original urls
    covers = []
    site_md = ["# frozenvibes.in — extracted content\n"]

    for pg in pages:
        slug = pg["slug"]
        is_gallery = "/photos/" in pg["link"] and slug != "photos"
        folder = f"photos/{slug}" if is_gallery else slug
        print(" ", folder)
        htmls = rendered_pages(pg["link"])
        (CONTENT / "pages" / f"{slug}.html").write_text("\n<!-- next page -->\n".join(htmls))

        main_html = htmls[0]
        m = re.search(r"(?is)<main[^>]*>(.*)</main>", main_html) or re.search(r"(?is)<body[^>]*>(.*)</body>", main_html)
        body = text_of(m.group(1) if m else pg["content"]["rendered"])
        title = html.unescape(pg["title"]["rendered"])
        (CONTENT / "pages" / f"{slug}.md").write_text(f"# {title}\n\n{pg['link']}\n\n{body}\n")
        site_md.append(f"\n---\n\n## {title}  (`{pg['link']}`)\n\n{body}\n")

        urls = ordered_unique(original_url(u, library) for h in htmls for u in IMG_RE.findall(h))
        order[folder] = urls
        for u in urls:
            usage.setdefault(u, []).append(folder)

        if slug == "photos":
            for href, inner in re.findall(r'(?is)<a[^>]+href="(https://frozenvibes\.in/photos/[^"]+)"[^>]*>(.*?)</a>', main_html):
                imgs = IMG_RE.findall(inner)
                if imgs:
                    covers.append({"slug": href.rstrip("/").split("/")[-1], "cover": original_url(imgs[0], library)})

        if slug == "films":
            c = pg["content"]["rendered"]
            films = []
            for block in re.split(r"(?i)<figure", c)[1:]:
                vid = re.search(r"youtube\.com/embed/([\w-]{11})", block)
                if not vid:
                    continue
                t = re.search(r'title="([^"]+)"', block)
                films.append({"youtube_id": vid.group(1), "embed_title": html.unescape(t.group(1)) if t else None})
            # visible captions/headings on the page, in order, for pairing up titles
            captions = [x for x in text_of(c).split("\n") if x.strip()]
            (CONTENT / "films.json").write_text(json.dumps({"films": films, "page_captions": captions}, indent=2, ensure_ascii=False))

    (CONTENT / "covers.json").write_text(json.dumps(covers, indent=2))

    # Media library items not shown anywhere on the site.
    for m in media:
        u = m["source_url"]
        if u not in usage:
            usage[u] = ["library-unused"]
            order.setdefault("library-unused", []).append(u)

    # Assign local paths: each original saved once, under the first folder that uses it.
    jobs, rows = [], []
    for folder, urls in order.items():
        n = 0
        for u in urls:
            if usage[u][0] != folder:
                continue
            n += 1
            name = unquote(Path(urlparse(u).path).name)
            prefix = f"{n:03d}-" if folder.startswith("photos/") else ""
            dest = IMAGES / folder / f"{prefix}{name}"
            jobs.append((u, dest))

    def download(job):
        u, dest = job
        if dest.exists() and is_complete(dest.read_bytes()):
            return u, dest, "cached"
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            data = get(u)
        except Exception as e:  # noqa: BLE001
            return u, dest, f"ERROR {e}"
        if data[:15].lstrip().lower().startswith((b"<!doctype", b"<html")):
            return u, dest, "ERROR got HTML"
        if not is_complete(data):
            return u, dest, "ERROR truncated"
        tmp = dest.with_suffix(dest.suffix + ".part")
        tmp.write_bytes(data)
        tmp.replace(dest)  # atomic, so an interrupted run never leaves a half-written image
        return u, dest, "ok"

    print(f"downloading {len(jobs)} images…")
    errors = 0
    with ThreadPoolExecutor(max_workers=2) as pool:
        for u, dest, status in pool.map(download, jobs):
            if status.startswith("ERROR"):
                errors += 1
                print("  ", status, u, file=sys.stderr)
                continue
            w, h = image_dims(dest)
            rows.append([str(dest.relative_to(ROOT.parent)), u, ";".join(usage[u]), w, h, dest.stat().st_size])

    with open(CONTENT / "manifest.csv", "w", newline="") as f:
        wr = csv.writer(f)
        wr.writerow(["local_path", "source_url", "pages", "width", "height", "bytes"])
        wr.writerows(rows)

    (CONTENT / "site.md").write_text("".join(site_md))
    print(f"done: {len(rows)} images, {errors} errors")


if __name__ == "__main__":
    main()
