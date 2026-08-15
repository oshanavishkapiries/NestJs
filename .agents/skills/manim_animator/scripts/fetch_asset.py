#!/usr/bin/env python3
import sys
import os
import urllib.request
import urllib.parse
import json

def fetch_icon(query_or_url, output_path):
    """
    Downloads vector SVG or clipart PNG image for Manim animations.
    Supports direct URLs or icon queries via open Iconify / SVG APIs (e.g. lucide, mdi, solar, tabler).
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # 1. If direct URL (http/https)
    if query_or_url.startswith("http://") or query_or_url.startswith("https://"):
        url = query_or_url
    else:
        # 2. Try fetching from public icon CDNs (lucide, mdi, solar, tabler)
        icon_name = query_or_url.lower().strip().replace(" ", "-")
        prefixes = ["lucide", "mdi", "tabler", "solar"]
        
        url = None
        for prefix in prefixes:
            test_url = f"https://api.iconify.design/{prefix}/{icon_name}.svg"
            try:
                req = urllib.request.Request(test_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status == 200:
                        content = response.read().decode('utf-8')
                        if "<svg" in content:
                            url = test_url
                            print(f"[Asset Fetcher] Found vector icon on Iconify: {prefix}:{icon_name}")
                            break
            except Exception:
                continue
        
        if not url:
            # Fallback to direct lucide URL construct
            url = f"https://api.iconify.design/lucide/{icon_name}.svg"

    print(f"[Asset Fetcher] Downloading asset from: {url}")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = response.read()
            with open(output_path, 'wb') as f:
                f.write(data)
            print(f"[Asset Fetcher] Successfully saved asset to: {output_path}")
            return True
    except Exception as e:
        print(f"[Asset Fetcher Error] Failed to download {url}: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 fetch_asset.py <icon_name_or_url> <output_filepath>")
        print("Example: python3 fetch_asset.py wallet animations/bitcoin/assets/wallet.svg")
        sys.exit(1)
        
    query_or_url = sys.argv[1]
    output_path = sys.argv[2]
    fetch_icon(query_or_url, output_path)
