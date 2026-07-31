#!/usr/bin/env python3
"""check-images.py — static check that every image referenced in HTML / CSS
actually exists in the repo.

Catches "missing image" bugs (the office-tower project2.png incident).

Exit code:
  0 - all references resolve
  1 - at least one referenced file is missing (workflow marks this red)

Usage:  python scripts/check-images.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# File extensions we treat as image refs
IMG_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".avif")

# 1) collect every file in repo
all_files = set()
for r, _, fs in os.walk(ROOT):
    for f in fs:
        rel = os.path.relpath(os.path.join(r, f), ROOT).replace(os.sep, "/")
        all_files.add(rel)

# also strip out the .git dir if any
all_files = {p for p in all_files if not p.startswith(".git/")}

# 2) scan HTML / CSS / JS for image references
# patterns:
#   <img src="...">
#   <img srcset="a.jpg 1x, b.jpg 2x">  (each url)
#   url('...') / url("...") in CSS (background-image, content, etc.)
#   <link rel="icon" href="...">
#   <source src="..." srcset="...">
# we deliberately keep it simple & conservative.

img_pattern = re.compile(
    r"""(?xs)
    (?:
        \bsrc\s*=\s*['"]([^'"]+)['"]
      | \bsrcset\s*=\s*['"]([^'"]+)['"]
      | \bhref\s*=\s*['"]([^'"]+\.(?:png|jpg|jpeg|webp|svg|ico|gif|avif))['"]
      | url\(\s*['"]?([^'")]+)['"]?\s*\)
    )
    """
)

# candidates extracted by the regex
candidates = []
extracted_count = 0
for r, _, fs in os.walk(ROOT):
    for f in fs:
        if not f.lower().endswith((".html", ".css", ".js")):
            continue
        rel = os.path.relpath(os.path.join(r, f), ROOT).replace(os.sep, "/")
        try:
            with open(os.path.join(r, f), "r", encoding="utf-8") as fp:
                content = fp.read()
        except Exception:
            continue
        for m in img_pattern.finditer(content):
            extracted_count += 1
            for g in m.groups():
                if not g:
                    continue
                value = g.strip()
                # srcset can have "1x" / "800w" descriptors after a comma-separated url
                if "," in value and " " in value and not value.startswith("data:"):
                    # split and take the first whitespace-delimited token
                    parts = [p.strip().split()[0] for p in value.split(",")]
                    for p in parts:
                        candidates.append((rel, p))
                else:
                    candidates.append((rel, value))

# 3) resolve each candidate to a path inside the repo
# skip: data: URIs, absolute http(s) URLs, anchors, #fragment
missing = []
seen = set()
for src_file, ref in candidates:
    if ref.startswith("data:"):
        continue
    if ref.startswith(("http://", "https://", "//", "mailto:", "tel:")):
        continue
    if ref.startswith("#"):
        continue

    # strip query / fragment
    clean = ref.split("?", 1)[0].split("#", 1)[0]
    if not clean:
        continue

    # resolve relative to the file that referenced it
    src_dir = os.path.dirname(src_file)
    abs_ref = os.path.normpath(os.path.join(src_dir, clean)).replace(os.sep, "/")
    if abs_ref.startswith("./"):
        abs_ref = abs_ref[2:]
    # accept the same file if extension is an image ext
    if not abs_ref.lower().endswith(IMG_EXTS):
        continue
    if abs_ref in seen:
        continue
    seen.add(abs_ref)

    if abs_ref not in all_files:
        missing.append((src_file, ref, abs_ref))

# 4) report
print(f"scanned {extracted_count} image references")
print(f"  - unique paths: {len(seen)}")
print(f"  - files in repo: {len(all_files)}")
print()
if not missing:
    print("OK - all referenced image files exist in the repo.")
    sys.exit(0)

print(f"FAIL - {len(missing)} referenced image(s) missing:")
print()
for src_file, ref, resolved in missing:
    print(f"  in {src_file}")
    print(f"    -> {ref}")
    print(f"    resolved to: {resolved}  (NOT FOUND)")
    print()
sys.exit(1)
