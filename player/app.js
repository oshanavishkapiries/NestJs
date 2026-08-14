/**
 * Universal Frame Animation Player Application
 * Node.js Express Backend Powered
 */
class FramePlayer {
  constructor() {
    // DOM Elements
    this.canvas = document.getElementById('animationCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.viewport = document.getElementById('viewportContainer');
    
    this.topicSelect = document.getElementById('topicSelect');
    this.speedSelect = document.getElementById('speedSelect');
    
    this.btnPlayPause = document.getElementById('btnPlayPause');
    this.iconPlay = document.getElementById('iconPlay');
    this.iconPause = document.getElementById('iconPause');
    this.btnPrev = document.getElementById('btnPrevFrame');
    this.btnNext = document.getElementById('btnNextFrame');
    this.btnLoop = document.getElementById('btnLoop');
    this.btnFullscreen = document.getElementById('btnFullscreen');
    
    this.slider = document.getElementById('timelineSlider');
    this.frameCounter = document.getElementById('frameCounter');
    this.timeCounter = document.getElementById('timeCounter');
    
    this.overlay = document.getElementById('loadingOverlay');
    this.loadingText = document.getElementById('loadingText');
    this.progressFill = document.getElementById('preloadProgressFill');

    // Player State
    this.manifest = null;
    this.currentTopic = null;
    this.frames = [];
    this.totalFrames = 0;
    this.fps = 15;
    this.speed = 1.0;
    
    this.currentFrameIdx = 0;
    this.isPlaying = false;
    this.isLooping = true;
    this.animFrameId = null;
    this.lastFrameTime = 0;
    this.isScrubbing = false;

    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadGlobalManifest();
  }

  async loadGlobalManifest() {
    try {
      const res = await fetch('/api/manifest');
      if (!res.ok) throw new Error('Global manifest endpoint error');
      this.manifest = await res.json();
      
      this.topicSelect.innerHTML = '';
      if (!this.manifest.topics || this.manifest.topics.length === 0) {
        this.loadingText.textContent = 'No animation topics found in animations/manifest.json';
        return;
      }

      this.manifest.topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.title;
        this.topicSelect.appendChild(opt);
      });

      this.loadTopic(this.manifest.topics[0].id);
    } catch (e) {
      console.error('Failed to load global manifest:', e);
      this.loadingText.textContent = 'Error fetching /api/manifest from server';
    }
  }

  async loadTopic(topicId) {
    this.pause();
    this.showOverlay();
    
    const topicMeta = this.manifest.topics.find(t => t.id === topicId);
    if (!topicMeta) return;

    this.currentTopic = topicMeta;
    this.fps = topicMeta.fps || 15;
    this.totalFrames = topicMeta.total_frames || 0;
    this.currentFrameIdx = 0;

    // Load individual topic details from express API
    try {
      const topicRes = await fetch(`/api/topics/${topicId}`);
      if (topicRes.ok) {
        const details = await topicRes.json();
        this.fps = details.fps || this.fps;
        this.totalFrames = details.total_frames || this.totalFrames;
      }
    } catch (e) {}

    // Preload image frames from Express static endpoint /animations/<folder>/frames/...
    this.frames = new Array(this.totalFrames);
    let loadedCount = 0;

    const folder = topicMeta.folder;
    this.slider.max = Math.max(0, this.totalFrames - 1);
    this.slider.value = 0;

    for (let i = 0; i < this.totalFrames; i++) {
      const img = new Image();
      const paddedIdx = String(i).padStart(4, '0');
      img.src = `/animations/${folder}/frames/frame_${paddedIdx}.png`;
      
      img.onload = () => {
        loadedCount++;
        const pct = Math.round((loadedCount / this.totalFrames) * 100);
        this.loadingText.textContent = `Preloading frames: ${loadedCount} / ${this.totalFrames} (${pct}%)`;
        this.progressFill.style.width = `${pct}%`;
        
        if (loadedCount === 1) {
          this.canvas.width = img.naturalWidth || 1280;
          this.canvas.height = img.naturalHeight || 720;
          this.renderFrame(0);
        }

        if (loadedCount === this.totalFrames) {
          this.hideOverlay();
          this.updateDisplay();
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === this.totalFrames) {
          this.hideOverlay();
          this.updateDisplay();
        }
      };

      this.frames[i] = img;
    }
  }

  bindEvents() {
    this.topicSelect.addEventListener('change', (e) => this.loadTopic(e.target.value));
    
    this.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
    this.btnPrev.addEventListener('click', () => this.stepFrame(-1));
    this.btnNext.addEventListener('click', () => this.stepFrame(1));
    
    this.btnLoop.addEventListener('click', () => {
      this.isLooping = !this.isLooping;
      this.btnLoop.classList.toggle('active', this.isLooping);
    });

    this.speedSelect.addEventListener('change', (e) => {
      this.speed = parseFloat(e.target.value);
    });

    this.slider.addEventListener('input', (e) => {
      this.isScrubbing = true;
      this.currentFrameIdx = parseInt(e.target.value, 10);
      this.renderFrame(this.currentFrameIdx);
      this.updateDisplay();
    });

    this.slider.addEventListener('change', () => {
      this.isScrubbing = false;
    });

    this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT'].includes(document.activeElement.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          this.togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.stepFrame(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.stepFrame(1);
          break;
        case 'Home':
          e.preventDefault();
          this.seekTo(0);
          break;
        case 'End':
          e.preventDefault();
          this.seekTo(this.totalFrames - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          this.toggleFullscreen();
          break;
      }
    });
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.totalFrames === 0) return;
    if (this.currentFrameIdx >= this.totalFrames - 1) {
      this.currentFrameIdx = 0;
    }
    this.isPlaying = true;
    this.iconPlay.classList.add('hidden');
    this.iconPause.classList.remove('hidden');
    this.lastFrameTime = performance.now();
    this.loop();
  }

  pause() {
    this.isPlaying = false;
    this.iconPlay.classList.remove('hidden');
    this.iconPause.classList.add('hidden');
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  loop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const frameInterval = 1000 / (this.fps * this.speed);
    const elapsed = now - this.lastFrameTime;

    if (elapsed >= frameInterval) {
      this.lastFrameTime = now - (elapsed % frameInterval);
      
      if (this.currentFrameIdx < this.totalFrames - 1) {
        this.currentFrameIdx++;
      } else {
        if (this.isLooping) {
          this.currentFrameIdx = 0;
        } else {
          this.pause();
          return;
        }
      }

      this.renderFrame(this.currentFrameIdx);
      this.updateDisplay();
    }

    this.animFrameId = requestAnimationFrame(() => this.loop());
  }

  stepFrame(delta) {
    this.pause();
    let newIdx = this.currentFrameIdx + delta;
    if (newIdx < 0) newIdx = 0;
    if (newIdx >= this.totalFrames) newIdx = this.totalFrames - 1;
    
    this.currentFrameIdx = newIdx;
    this.renderFrame(this.currentFrameIdx);
    this.updateDisplay();
  }

  seekTo(idx) {
    this.pause();
    this.currentFrameIdx = Math.max(0, Math.min(idx, this.totalFrames - 1));
    this.renderFrame(this.currentFrameIdx);
    this.updateDisplay();
  }

  renderFrame(idx) {
    const img = this.frames[idx];
    if (img && img.complete && img.naturalWidth > 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  updateDisplay() {
    if (!this.isScrubbing) {
      this.slider.value = this.currentFrameIdx;
    }

    this.frameCounter.textContent = `Frame: ${this.currentFrameIdx + 1} / ${this.totalFrames}`;
    
    const currSec = (this.currentFrameIdx / this.fps).toFixed(1);
    const totalSec = (this.totalFrames / this.fps).toFixed(1);
    this.timeCounter.textContent = `${this.formatTime(currSec)} / ${this.formatTime(totalSec)}`;
  }

  formatTime(seconds) {
    const secNum = parseFloat(seconds);
    const mins = Math.floor(secNum / 60);
    const secs = (secNum % 60).toFixed(1);
    const formattedSecs = secs < 10 ? '0' + secs : secs;
    return `${String(mins).padStart(2, '0')}:${formattedSecs}`;
  }

  showOverlay() {
    this.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.viewport.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.player = new FramePlayer();
});
