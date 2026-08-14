#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(SKILL_DIR, '.manim_config.json');
const FONTS_DIR = path.join(SKILL_DIR, 'assets', 'fonts');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node scripts/render.js <path-to-script.py> <SceneName> [manim-flags]');
  console.log('Example: node scripts/render.js animations/binary_search/visual.py BinarySearchScene -qm');
  process.exit(1);
}

const scriptPath = path.resolve(args[0]);
const sceneName = args[1];
// Default to -qm (720p resolution, 1280x720)
const extraFlags = args.slice(2).join(' ') || '-qm';

let mode = 'docker';
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    mode = config.mode || 'docker';
  } catch (e) {}
}

const workspaceDir = process.cwd();

// Infer topic folder name from script path
const topicFolder = path.basename(path.dirname(scriptPath));
console.log(`[Manim Frame Engine] Mode: ${mode}`);
console.log(`Topic      : ${topicFolder}`);
console.log(`Script     : ${scriptPath}`);
console.log(`Scene      : ${sceneName}`);
console.log(`Resolution : 720p (-qm / 1280x720)`);

// Ensure PNG frame export mode
const renderFlags = `${extraFlags} --format=png`;

if (mode === 'docker') {
  let fontMount = '';
  if (fs.existsSync(FONTS_DIR)) {
    fontMount = `-v "${FONTS_DIR}":/usr/share/fonts/poppins`;
  }
  
  const relScriptPath = scriptPath.replace(workspaceDir + '/', '');
  const dockerCmd = `docker run --rm -v "${workspaceDir}":/manim ${fontMount} manimcommunity/manim manim ${renderFlags} "${relScriptPath}" "${sceneName}"`;
  console.log(`Executing: ${dockerCmd}`);
  execSync(dockerCmd, { stdio: 'inherit' });
} else {
  const venvManim = path.join(SKILL_DIR, '.venv', 'bin', 'manim');
  const manimCmd = fs.existsSync(venvManim) ? venvManim : 'manim';
  const fullCmd = `${manimCmd} ${renderFlags} "${scriptPath}" "${sceneName}"`;
  console.log(`Executing: ${fullCmd}`);
  execSync(fullCmd, { stdio: 'inherit' });
}

// Helper to recursively find PNG files matching sceneName
function findPngFiles(dir, prefix) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(findPngFiles(fullPath, prefix));
    } else if (item.isFile() && item.name.startsWith(prefix) && item.name.endsWith('.png')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Organize rendered frame PNGs into animations/<topic>/frames/
const targetFramesDir = path.join(workspaceDir, 'animations', topicFolder, 'frames');
if (!fs.existsSync(targetFramesDir)) {
  fs.mkdirSync(targetFramesDir, { recursive: true });
}

const imagesSearchDir = path.join(workspaceDir, 'media', 'images');
const foundImages = findPngFiles(imagesSearchDir, sceneName).sort();

if (foundImages.length > 0) {
  console.log(`Organizing ${foundImages.length} 720p frame images into ${targetFramesDir}...`);
  foundImages.forEach((imgFile, idx) => {
    const paddedIdx = String(idx).padStart(4, '0');
    const destPath = path.join(targetFramesDir, `frame_${paddedIdx}.png`);
    fs.copyFileSync(imgFile, destPath);
  });

  // Create topic manifest
  const topicManifestPath = path.join(workspaceDir, 'animations', topicFolder, 'manifest.json');
  const topicManifest = {
    topic: topicFolder,
    title: sceneName.replace(/([A-Z])/g, ' $1').trim(),
    resolution: "720p (1280x720)",
    total_frames: foundImages.length,
    fps: 30,
    frame_prefix: "frames/frame_",
    frame_digits: 4,
    frame_extension: ".png"
  };
  fs.writeFileSync(topicManifestPath, JSON.stringify(topicManifest, null, 2));

  // Update global manifest
  const globalManifestPath = path.join(workspaceDir, 'animations', 'manifest.json');
  let globalManifest = { topics: [] };
  if (fs.existsSync(globalManifestPath)) {
    try {
      globalManifest = JSON.parse(fs.readFileSync(globalManifestPath, 'utf8'));
    } catch (e) {}
  }

  const existingIdx = globalManifest.topics.findIndex(t => t.id === topicFolder);
  const topicEntry = {
    id: topicFolder,
    title: topicManifest.title,
    folder: topicFolder,
    resolution: "720p",
    total_frames: foundImages.length,
    fps: 30
  };

  if (existingIdx >= 0) {
    globalManifest.topics[existingIdx] = topicEntry;
  } else {
    globalManifest.topics.push(topicEntry);
  }

  fs.writeFileSync(globalManifestPath, JSON.stringify(globalManifest, null, 2));
  console.log(`[Success] Updated 720p frame manifests. Open player/index.html to play!`);
}
