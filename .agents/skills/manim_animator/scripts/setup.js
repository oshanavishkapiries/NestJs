#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(SKILL_DIR, '.manim_config.json');

console.log('==================================================');
console.log('   Manim Setup (Local Python Venv Engine)         ');
console.log('==================================================\n');

function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function getVersion(cmd) {
  try {
    return execSync(`${cmd} --version`, { encoding: 'utf8' }).trim().split('\n')[0];
  } catch (e) {
    return 'Available';
  }
}

const hasPython3 = commandExists('python3');
const hasNode = commandExists('node');
const hasFfmpeg = commandExists('ffmpeg');
const venvManim = path.join(SKILL_DIR, '.venv', 'bin', 'manim');
const hasVenvManim = fs.existsSync(venvManim);

console.log('🔍 Environment Discovered:');
console.log(`   [Python3]    : ${hasPython3 ? '✅ ' + getVersion('python3') : '❌ Missing'}`);
console.log(`   [Node.js]    : ${hasNode ? '✅ ' + getVersion('node') : '❌ Missing'}`);
console.log(`   [FFmpeg]     : ${hasFfmpeg ? '✅ Installed' : '⚠️ Missing'}`);
console.log(`   [Local Venv] : ${hasVenvManim ? '✅ Ready (.venv/bin/manim)' : '⚠️ Missing'}\n`);

const chosenMode = 'venv';
console.log('🎯 OPTION CHOSEN: [NATIVE PYTHON VENV]');
console.log('   -> Dependencies encapsulated inside project .venv directory.\n');

const config = {
  mode: chosenMode,
  has_node: hasNode,
  has_python3: hasPython3,
  has_ffmpeg: hasFfmpeg,
  has_venv_manim: hasVenvManim,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
console.log(`Saved mode selection to: ${CONFIG_FILE}\n`);

console.log('==================================================');
console.log(`  Manim Setup Complete! Mode: [${chosenMode}]`);
console.log('==================================================');
