#!/usr/bin/env python3
import os
import sys
import shutil
import json
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
CONFIG_FILE = SKILL_DIR / ".manim_config.json"
VENV_MANIM = SKILL_DIR / ".venv" / "bin" / "manim"

print("==================================================")
print("  Manim Environment Inspector (Local Venv)       ")
print("==================================================\n")

def check_cmd(cmd):
    return shutil.which(cmd) is not None

status = {
    "python3": True,
    "node": check_cmd("node"),
    "ffmpeg": check_cmd("ffmpeg"),
    "venv_manim": VENV_MANIM.exists()
}

print("Detected Device Environment:")
print(f"  - Python 3  : ✅ {sys.version.split()[0]}")
print(f"  - Node.js   : {'✅ Installed' if status['node'] else '❌ Missing'}")
print(f"  - FFmpeg    : {'✅ Installed' if status['ffmpeg'] else '⚠️ Missing'}")
print(f"  - Local Venv: {'✅ Ready (.venv/bin/manim)' if status['venv_manim'] else '⚠️ Missing'}\n")

chosen_mode = "venv"
print("🐍 Option Selected: [LOCAL PYTHON VENV MODE]")
print("   -> All dependencies encapsulated inside workspace .venv.\n")

config = {
    "mode": chosen_mode,
    "timestamp": sys.hexversion,
    "environment": status
}

with open(CONFIG_FILE, "w") as f:
    json.dump(config, f, indent=2)

print(f"Config saved to: {CONFIG_FILE}")
print("\n==================================================")
print("Setup Inspection Complete!")
print("==================================================")
