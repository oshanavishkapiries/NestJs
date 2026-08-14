#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(SKILL_DIR, '.manim_config.json');

console.log('==================================================');
console.log('   Manim Multi-Runtime Setup (Node.js Engine)     ');
console.log('==================================================\n');

function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function isDockerActive() {
  try {
    execSync('docker ps', { stdio: 'ignore' });
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
const hasApt = commandExists('apt');
const hasDocker = isDockerActive();

console.log('🔍 Device Capabilities Discovered:');
console.log(`   [Node.js] : ${hasNode ? '✅ ' + getVersion('node') : '❌ Missing'}`);
console.log(`   [Python3] : ${hasPython3 ? '✅ ' + getVersion('python3') : '❌ Missing'}`);
console.log(`   [Docker]  : ${hasDocker ? '✅ Ready (Daemon active)' : '❌ Not available'}`);
console.log(`   [FFmpeg]  : ${hasFfmpeg ? '✅ Installed' : '⚠️ Missing'}`);
console.log(`   [Apt]     : ${hasApt ? '✅ Available' : '❌ Missing'}\n`);

let chosenMode = 'docker';
if (hasDocker) {
  chosenMode = 'docker';
  console.log('🎯 BEST OPTION CHOSEN: [DOCKER ENGINE]');
  console.log('   -> Docker daemon active: Renders using official manimcommunity/manim image.');
  console.log('   -> Zero local C/C++ header compilation or LaTeX setup required.\n');
} else if (hasNode) {
  chosenMode = 'node_venv';
  console.log('🎯 BEST OPTION CHOSEN: [NODE.JS + PYTHON HYBRID]\n');
} else {
  chosenMode = 'venv';
  console.log('🎯 BEST OPTION CHOSEN: [NATIVE PYTHON VENV]\n');
}

const config = {
  mode: chosenMode,
  has_docker: hasDocker,
  has_node: hasNode,
  has_python3: hasPython3,
  has_ffmpeg: hasFfmpeg,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
console.log(`Saved mode selection to: ${CONFIG_FILE}\n`);

console.log('==================================================');
console.log(`  Manim Setup Complete! Mode: [${chosenMode}]`);
console.log('==================================================');
