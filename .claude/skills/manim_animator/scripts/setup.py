#!/usr/bin/env python3
import os
import sys
import shutil
import subprocess
import json
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
CONFIG_FILE = SKILL_DIR / ".manim_config.json"

print("==================================================")
print("  Manim Multi-Runtime Device Inspector (Python)  ")
print("==================================================\n")

def check_cmd(cmd):
    return shutil.which(cmd) is not None

def check_docker():
    try:
        res = subprocess.run(["docker", "ps"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return res.returncode == 0
    except Exception:
        return False

status = {
    "python3": True,
    "node": check_cmd("node"),
    "docker": check_docker(),
    "ffmpeg": check_cmd("ffmpeg"),
    "apt": check_cmd("apt")
}

print("Detected Device Environment:")
print(f"  - Python 3: ✅ {sys.version.split()[0]}")
print(f"  - Node.js : {'✅ Installed' if status['node'] else '❌ Missing'}")
print(f"  - Docker  : {'✅ Ready (Daemon running)' if status['docker'] else '❌ Not available'}")
print(f"  - FFmpeg  : {'✅ Installed' if status['ffmpeg'] else '⚠️ Missing'}")
print(f"  - Apt     : {'✅ Available' if status['apt'] else '❌ Missing'}\n")

if status["docker"]:
    chosen_mode = "docker"
    print("🚀 Optimal Option Selected: [DOCKER MODE]")
    print("   -> Docker is active! Manim will run inside official manimcommunity/manim image.")
    print("   -> Advantage: Zero local library setup required.\n")
elif status["ffmpeg"]:
    chosen_mode = "venv"
    print("🐍 Option Selected: [PYTHON VENV MODE]")
    print("   -> Local Python environment will be configured.\n")
else:
    chosen_mode = "docker" if status["docker"] else "venv"
    print("⚠️ Local media libraries missing. Recommending Docker or apt package install.\n")

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
