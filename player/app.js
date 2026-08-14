/**
 * ExcaliPlayer - Excalidraw-Style Infinite Canvas with Pan & Zoom
 * Keyboard Shortcut Suite & Click Viewport Screen to Play/Pause
 */

class VideoWidget {
  constructor(app, topicMeta, initialFrame = 0, initialPos = null) {
    this.app = app;
    this.topicMeta = topicMeta;
    this.currentFrameIdx = initialFrame;
    this.totalFrames = topicMeta.total_frames || 0;
    this.fps = topicMeta.fps || 15;
    this.speed = 1.0;
    
    this.isPlaying = false;
    this.isLooping = true;
    this.animFrameId = null;
    this.lastFrameTime = 0;
    this.frames = [];

    const defaultW = Math.min(640, window.innerWidth * 0.55);
    const defaultH = Math.min(380, defaultW * (9 / 16));
    const defaultX = (window.innerWidth - defaultW) / 2;
    const defaultY = (window.innerHeight - defaultH) / 2;

    this.pos = initialPos || {
      x: defaultX,
      y: defaultY,
      width: defaultW,
      height: defaultH
    };

    this.createElement();
    this.loadFrames();
  }

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'video-widget';
    this.el.style.left = `${this.pos.x}px`;
    this.el.style.top = `${this.pos.y}px`;
    this.el.style.width = `${this.pos.width}px`;
    this.el.style.height = `${this.pos.height}px`;

    this.el.innerHTML = `
      <div class="widget-header">
        <span class="widget-title">${this.topicMeta.title}</span>
        <button class="widget-btn-close" title="Close Widget">✕</button>
      </div>

      <div class="widget-viewport">
        <canvas class="widget-anim-canvas"></canvas>
        <div class="viewport-play-flash hidden"></div>
      </div>

      <div class="widget-controls-bar">
        <div class="widget-timeline">
          <input type="range" class="widget-slider" min="0" max="${Math.max(0, this.totalFrames - 1)}" value="${this.currentFrameIdx}" step="1">
        </div>
        <div class="widget-controls-row">
          <div class="button-group">
            <button class="widget-play-btn" title="Play/Pause">
              <svg class="icon-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <svg class="icon-pause hidden" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            </button>
          </div>

          <span class="widget-counter mono">Frame ${this.currentFrameIdx + 1} / ${this.totalFrames}</span>

          <div class="right-controls">
            <select class="widget-speed-select">
              <option value="0.5">0.5x</option>
              <option value="1.0" selected>1.0x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>
          </div>
        </div>
      </div>

      <div class="resize-handle handle-se" data-handle="se"></div>
      <div class="resize-handle handle-sw" data-handle="sw"></div>
      <div class="resize-handle handle-ne" data-handle="ne"></div>
      <div class="resize-handle handle-nw" data-handle="nw"></div>

      <div class="resize-edge edge-n" data-handle="n"></div>
      <div class="resize-edge edge-s" data-handle="s"></div>
      <div class="resize-edge edge-e" data-handle="e"></div>
      <div class="resize-edge edge-w" data-handle="w"></div>
    `;

    this.canvas = this.el.querySelector('.widget-anim-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.slider = this.el.querySelector('.widget-slider');
    this.playBtn = this.el.querySelector('.widget-play-btn');
    this.iconPlay = this.el.querySelector('.icon-play');
    this.iconPause = this.el.querySelector('.icon-pause');
    this.counterEl = this.el.querySelector('.widget-counter');
    this.speedSelect = this.el.querySelector('.widget-speed-select');
    this.btnClose = this.el.querySelector('.widget-btn-close');
    this.header = this.el.querySelector('.widget-header');
    this.viewport = this.el.querySelector('.widget-viewport');
    this.flashEl = this.el.querySelector('.viewport-play-flash');

    this.app.widgetsLayer.appendChild(this.el);
    this.bindEvents();
  }

  loadFrames() {
    this.app.showOverlay();
    this.frames = new Array(this.totalFrames);
    let loaded = 0;
    const folder = this.topicMeta.folder;

    for (let i = 0; i < this.totalFrames; i++) {
      const img = new Image();
      const padded = String(i).padStart(4, '0');
      img.src = `/animations/${folder}/frames/frame_${padded}.png`;

      img.onload = () => {
        loaded++;
        const pct = Math.round((loaded / this.totalFrames) * 100);
        this.app.loadingText.textContent = `Loading ${this.topicMeta.title}: ${loaded}/${this.totalFrames} (${pct}%)`;
        this.app.progressFill.style.width = `${pct}%`;

        if (loaded === 1) {
          this.resizeCanvas();
          this.renderFrame(this.currentFrameIdx);
        }

        if (loaded === this.totalFrames) {
          this.app.hideOverlay();
          this.updateDisplay();
        }
      };

      img.onerror = () => {
        loaded++;
        if (loaded === this.totalFrames) this.app.hideOverlay();
      };

      this.frames[i] = img;
    }
  }

  resizeCanvas() {
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 640;
    const h = rect.height || 380;

    const firstImg = this.frames.find(img => img && img.naturalWidth > 0);
    const naturalW = firstImg ? firstImg.naturalWidth : 1280;
    const naturalH = firstImg ? firstImg.naturalHeight : 720;

    this.canvas.width = Math.max(Math.round(w * dpr), naturalW);
    this.canvas.height = Math.max(Math.round(h * dpr), naturalH);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.renderFrame(this.currentFrameIdx);
  }

  triggerPlayFlash() {
    if (!this.flashEl) return;
    this.flashEl.innerHTML = this.isPlaying
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    this.flashEl.classList.remove('hidden');
    setTimeout(() => this.flashEl.classList.add('hidden'), 350);
  }

  bindEvents() {
    // 1. Click Video Screen Viewport to Play/Pause
    this.viewport.addEventListener('click', (e) => {
      if (this.app.activeTool !== 'select') return; // Don't toggle play/pause if user is using drawing tools!
      e.stopPropagation();
      this.togglePlayPause();
      this.triggerPlayFlash();
    });

    this.playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePlayPause();
    });

    this.speedSelect.addEventListener('change', (e) => {
      e.stopPropagation();
      this.speed = parseFloat(e.target.value);
    });

    this.slider.addEventListener('input', (e) => {
      e.stopPropagation();
      this.currentFrameIdx = parseInt(e.target.value, 10);
      this.renderFrame(this.currentFrameIdx);
      this.updateDisplay();
    });

    this.slider.addEventListener('change', (e) => {
      e.stopPropagation();
      this.app.saveGlobalState();
    });

    this.btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.destroy();
    });

    let isDragging = false;
    let startX, startY, initX, initY;

    this.header.addEventListener('pointerdown', (e) => {
      if (e.target === this.btnClose) return;
      e.stopPropagation();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initX = this.pos.x;
      initY = this.pos.y;
      this.header.setPointerCapture(e.pointerId);
    });

    this.header.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      e.stopPropagation();
      const dx = (e.clientX - startX) / this.app.zoom;
      const dy = (e.clientY - startY) / this.app.zoom;
      this.pos.x = initX + dx;
      this.pos.y = initY + dy;
      this.el.style.left = `${this.pos.x}px`;
      this.el.style.top = `${this.pos.y}px`;
    });

    this.header.addEventListener('pointerup', (e) => {
      if (isDragging) {
        e.stopPropagation();
        isDragging = false;
        this.header.releasePointerCapture(e.pointerId);
        this.app.saveGlobalState();
      }
    });

    const resizers = this.el.querySelectorAll('.resize-handle, .resize-edge');
    resizers.forEach(h => {
      let isResizing = false;
      let startW, startH, startXPos, startYPos, rStartX, rStartY;

      h.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        isResizing = true;
        rStartX = e.clientX;
        rStartY = e.clientY;
        startW = this.pos.width;
        startH = this.pos.height;
        startXPos = this.pos.x;
        startYPos = this.pos.y;
        h.setPointerCapture(e.pointerId);
      });

      h.addEventListener('pointermove', (e) => {
        if (!isResizing) return;
        e.stopPropagation();
        const dx = (e.clientX - rStartX) / this.app.zoom;
        const dy = (e.clientY - rStartY) / this.app.zoom;
        const handleType = h.dataset.handle;

        const aspectRatio = startW / startH;

        if (handleType === 'se' || handleType === 'e' || handleType === 's') {
          let newW = Math.max(240, startW + dx);
          let newH = newW / aspectRatio;
          if (newH < 135) {
            newH = 135;
            newW = newH * aspectRatio;
          }
          this.pos.width = newW;
          this.pos.height = newH;
        } else if (handleType === 'sw' || handleType === 'w') {
          let newW = Math.max(240, startW - dx);
          let newH = newW / aspectRatio;
          if (newH < 135) {
            newH = 135;
            newW = newH * aspectRatio;
          }
          this.pos.x = startXPos + (startW - newW);
          this.pos.width = newW;
          this.pos.height = newH;
        } else if (handleType === 'ne') {
          let newW = Math.max(240, startW + dx);
          let newH = newW / aspectRatio;
          if (newH < 135) {
            newH = 135;
            newW = newH * aspectRatio;
          }
          this.pos.y = startYPos + (startH - newH);
          this.pos.width = newW;
          this.pos.height = newH;
        } else if (handleType === 'nw' || handleType === 'n') {
          let newW = Math.max(240, startW - dx);
          let newH = newW / aspectRatio;
          if (newH < 135) {
            newH = 135;
            newW = newH * aspectRatio;
          }
          this.pos.x = startXPos + (startW - newW);
          this.pos.y = startYPos + (startH - newH);
          this.pos.width = newW;
          this.pos.height = newH;
        }

        this.el.style.left = `${this.pos.x}px`;
        this.el.style.top = `${this.pos.y}px`;
        this.el.style.width = `${this.pos.width}px`;
        this.el.style.height = `${this.pos.height}px`;
        this.resizeCanvas();
      });

      h.addEventListener('pointerup', (e) => {
        if (isResizing) {
          e.stopPropagation();
          isResizing = false;
          h.releasePointerCapture(e.pointerId);
          this.app.saveGlobalState();
        }
      });
    });
  }

  togglePlayPause() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  play() {
    if (this.totalFrames === 0) return;
    if (this.currentFrameIdx >= this.totalFrames - 1) this.currentFrameIdx = 0;
    
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
        if (this.isLooping) this.currentFrameIdx = 0;
        else {
          this.pause();
          return;
        }
      }

      this.renderFrame(this.currentFrameIdx);
      this.updateDisplay();
    }

    this.animFrameId = requestAnimationFrame(() => this.loop());
  }

  renderFrame(idx) {
    const img = this.frames[idx];
    if (img && img.complete && img.naturalWidth > 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  updateDisplay() {
    this.slider.value = this.currentFrameIdx;
    this.counterEl.textContent = `Frame ${this.currentFrameIdx + 1} / ${this.totalFrames}`;
  }

  destroy() {
    this.pause();
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.app.activeWidget = null;
    this.app.saveGlobalState();
  }
}

class FramePlayer {
  constructor() {
    this.workspace = document.getElementById('boardWorkspace');
    this.drawCanvas = document.getElementById('drawingCanvas');
    this.drawCtx = this.drawCanvas.getContext('2d');
    this.widgetsLayer = document.getElementById('widgetsLayer');

    // GTA V Radial Wheel Elements (300px)
    this.gtaWheel = document.getElementById('gtaRadialWheel');
    this.wheelSvgBg = document.getElementById('wheelSvgBg');
    this.primaryIconsLayer = document.getElementById('wheelPrimaryIcons');
    this.submenuContainer = document.getElementById('wheelSubmenuContainer');

    // Excalidraw Zoom Pill Controls
    this.btnZoomOut = document.getElementById('btnZoomOut');
    this.btnZoomReset = document.getElementById('btnZoomReset');
    this.btnZoomIn = document.getElementById('btnZoomIn');

    this.toggleAnimBtn = document.getElementById('btnToggleAnimPanel');
    this.arrowIcon = document.getElementById('arrowIcon');
    this.animDrawer = document.getElementById('animDrawer');
    this.closeDrawerBtn = document.getElementById('btnCloseDrawer');
    this.cardsList = document.getElementById('animCardsList');

    this.overlay = document.getElementById('loadingOverlay');
    this.loadingText = document.getElementById('loadingText');
    this.progressFill = document.getElementById('preloadProgressFill');

    // State
    this.manifest = null;
    this.activeWidget = null;
    this.activeTool = 'select'; // 'select' | 'pen' | 'text' | 'eraser'
    this.strokeColor = '#ef4444';
    this.strokeWidth = 4;
    this.activeCategory = null;
    this.hoveredCategory = null;
    this.isDrawing = false;
    this.currentStroke = null;
    this.boardStrokes = [];

    // Excalidraw Infinite Canvas Camera State
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1.0;
    this.isPanning = false;
    this.isSpacePressed = false;
    this.panStartX = 0;
    this.panStartY = 0;

    this.init();
  }

  async init() {
    this.bindEvents();
    this.bindDrawingEvents();
    this.bindDrawerEvents();
    this.bindGtaRadialWheel();
    this.bindDragAndDrop();
    this.bindInfiniteCanvasControls();

    window.addEventListener('resize', () => this.resizeCanvases());
    this.resizeCanvases();
    
    await this.loadGlobalManifest();
    await this.loadGlobalState();
  }

  // --- World <-> Screen Coordinate Transformations ---
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.panX) / this.zoom,
      y: (screenY - this.panY) / this.zoom
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.zoom + this.panX,
      y: worldY * this.zoom + this.panY
    };
  }

  updateCameraTransform() {
    // 1. Update Video Widgets Container Layer CSS Transform
    this.widgetsLayer.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;

    // 2. Update Zoom Pill Button Label
    const zoomPct = Math.round(this.zoom * 100);
    this.btnZoomReset.textContent = `${zoomPct}%`;

    // 3. Redraw Drawing Canvas with Ultra-Sharp HiDPI Resolution
    this.redrawDrawingCanvas();
  }

  // --- Excalidraw Infinite Canvas Controls ---
  bindInfiniteCanvasControls() {
    // Zoom Buttons
    this.btnZoomIn.addEventListener('click', () => {
      this.setZoomAt(this.zoom * 1.15, window.innerWidth / 2, window.innerHeight / 2);
    });

    this.btnZoomOut.addEventListener('click', () => {
      this.setZoomAt(this.zoom / 1.15, window.innerWidth / 2, window.innerHeight / 2);
    });

    this.btnZoomReset.addEventListener('click', () => {
      this.panX = 0;
      this.panY = 0;
      this.zoom = 1.0;
      this.updateCameraTransform();
      this.saveGlobalState();
    });

    // Mouse Wheel / Trackpad Pinch Zooming
    window.addEventListener('wheel', (e) => {
      if (this.gtaWheel && !this.gtaWheel.classList.contains('hidden')) return;

      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.setZoomAt(this.zoom * zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Spacebar Key Handlers for Instant Pan
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space' && !this.isSpacePressed) {
        this.isSpacePressed = true;
        this.workspace.classList.add('is-panning');
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isSpacePressed = false;
        this.isPanning = false;
        this.workspace.classList.remove('is-panning', 'is-panning-active');
      }
    });
  }

  setZoomAt(newZoom, screenX, screenY) {
    const clampedZoom = Math.max(0.15, Math.min(4.0, newZoom));
    const world = this.screenToWorld(screenX, screenY);

    this.zoom = clampedZoom;
    this.panX = screenX - world.x * this.zoom;
    this.panY = screenY - world.y * this.zoom;

    this.updateCameraTransform();
    this.saveGlobalState();
  }

  // --- Polar Arc Path SVG Helper ---
  describeArcPath(cx, cy, rInner, rOuter, startAngleDeg, endAngleDeg) {
    const a1 = (startAngleDeg * Math.PI) / 180;
    const a2 = (endAngleDeg * Math.PI) / 180;

    const x1 = cx + rOuter * Math.cos(a1);
    const y1 = cy + rOuter * Math.sin(a1);
    const x2 = cx + rOuter * Math.cos(a2);
    const y2 = cy + rOuter * Math.sin(a2);

    const x3 = cx + rInner * Math.cos(a2);
    const y3 = cy + rInner * Math.sin(a2);
    const x4 = cx + rInner * Math.cos(a1);
    const y4 = cy + rInner * Math.sin(a1);

    const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

    return `M ${x4} ${y4} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  // --- Render Compact 8-Wedge Primary Wheel with Direct Tools (300px ViewBox) ---
  renderTwoTierRadialWheel() {
    const cx = 150, cy = 150;
    const rInner = 30;    // Empty Center Hub Hole (60px diameter)
    const rPrimary = 85;  // Primary Ring Outer Radius
    const rOuterIn = 88;  // Outer Sub-menu Inner Radius
    const rOuterOut = 138; // Outer Sub-menu Outer Radius

    // 8 Direct Primary Wedges ($45° per slice)
    const categories = [
      {
        id: 'color',
        title: 'COLOR',
        startAngle: -90,
        endAngle: -45,
        type: 'expand',
        iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`
      },
      {
        id: 'size',
        title: 'SIZE',
        startAngle: -45,
        endAngle: 0,
        type: 'expand',
        iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>`
      },
      {
        id: 'select',
        title: 'SELECT',
        startAngle: 0,
        endAngle: 45,
        type: 'tool',
        iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path></svg>`
      },
      {
        id: 'pen',
        title: 'PEN',
        startAngle: 45,
        endAngle: 90,
        type: 'tool',
        iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>`
      },
      {
        id: 'text',
        title: 'TEXT',
        startAngle: 90,
        endAngle: 135,
        type: 'tool',
        iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 7V4h16v3M9 20h6M12 4v16"></path></svg>`
      },
      {
        id: 'eraser',
        title: 'ERASER',
        startAngle: 135,
        endAngle: 180,
        type: 'tool',
        iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4"></path></svg>`
      },
      {
        id: 'undo',
        title: 'UNDO',
        startAngle: 180,
        endAngle: 225,
        type: 'action',
        iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>`
      },
      {
        id: 'clear',
        title: 'CLEAR',
        startAngle: 225,
        endAngle: 270,
        type: 'action',
        isDanger: true,
        iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
      }
    ];

    let svgHtml = '';
    let iconsHtml = '';
    let submenuHtml = '';

    // 1. Render Primary Ring Wedges
    categories.forEach(cat => {
      const d = this.describeArcPath(cx, cy, rInner, rPrimary, cat.startAngle, cat.endAngle);
      const isHovered = this.hoveredCategory === cat.id;
      const isToolActive = (cat.type === 'tool' && this.activeTool === cat.id);
      const isActiveCategory = (this.activeCategory === cat.id);
      const isHighlighted = isHovered || isToolActive || isActiveCategory;

      svgHtml += `<path class="primary-wedge ${cat.isDanger ? 'danger-wedge' : ''} ${isHighlighted ? 'active-wedge' : ''}" data-cat="${cat.id}" data-type="${cat.type}" d="${d}"></path>`;

      const midAngleRad = (((cat.startAngle + cat.endAngle) / 2) * Math.PI) / 180;
      const midR = (rInner + rPrimary) / 2;
      const iconX = cx + midR * Math.cos(midAngleRad);
      const iconY = cy + midR * Math.sin(midAngleRad);

      iconsHtml += `
        <div class="primary-icon-item ${isHighlighted ? 'active' : ''}" data-cat="${cat.id}" data-type="${cat.type}" style="left:${iconX}px; top:${iconY}px; transform:translate(-50%, -50%);">
          ${cat.iconSvg}
          <span class="slice-cat-label">${cat.title}</span>
        </div>
      `;
    });

    // 2. Render Expanded Outer Sub-Menu Arc for COLOR and SIZE
    if (this.activeCategory === 'color') {
      const startA = -110, endA = -25;
      const dOuter = this.describeArcPath(cx, cy, rOuterIn, rOuterOut, startA, endA);
      svgHtml += `<path class="outer-arc-bg" d="${dOuter}"></path>`;

      const colors = ['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ffffff', '#06b6d4'];
      const angleStep = (endA - startA) / colors.length;
      const rSub = (rOuterIn + rOuterOut) / 2;

      colors.forEach((col, idx) => {
        const itemAngleRad = ((startA + angleStep * idx + angleStep / 2) * Math.PI) / 180;
        const itemX = cx + rSub * Math.cos(itemAngleRad);
        const itemY = cy + rSub * Math.sin(itemAngleRad);
        const isSel = this.strokeColor === col;

        submenuHtml += `
          <div class="submenu-option-item" data-opt-color="${col}" style="left:${itemX}px; top:${itemY}px; transform:translate(-50%, -50%);">
            <span class="submenu-swatch ${isSel ? 'active' : ''}" style="background:${col};"></span>
          </div>
        `;
      });
    } else if (this.activeCategory === 'size') {
      const startA = -60, endA = 15;
      const dOuter = this.describeArcPath(cx, cy, rOuterIn, rOuterOut, startA, endA);
      svgHtml += `<path class="outer-arc-bg" d="${dOuter}"></path>`;

      const sizesList = [
        { width: 2, label: 'Thin' },
        { width: 4, label: 'Med' },
        { width: 8, label: 'Thick' }
      ];

      const angleStep = (endA - startA) / sizesList.length;
      const rSub = (rOuterIn + rOuterOut) / 2;

      sizesList.forEach((s, idx) => {
        const itemAngleRad = ((startA + angleStep * idx + angleStep / 2) * Math.PI) / 180;
        const itemX = cx + rSub * Math.cos(itemAngleRad);
        const itemY = cy + rSub * Math.sin(itemAngleRad);
        const isSel = this.strokeWidth === s.width;

        submenuHtml += `
          <div class="submenu-option-item" data-opt-size="${s.width}" style="left:${itemX}px; top:${itemY}px; transform:translate(-50%, -50%);">
            <button class="submenu-size-badge ${isSel ? 'active' : ''}">
              ${s.label}
            </button>
          </div>
        `;
      });
    }

    this.wheelSvgBg.innerHTML = svgHtml;
    this.primaryIconsLayer.innerHTML = iconsHtml;
    this.submenuContainer.innerHTML = submenuHtml;

    this.bindWheelInteractions();
  }

  bindWheelInteractions() {
    const primaryWedges = this.wheelSvgBg.querySelectorAll('.primary-wedge');

    const handleCategoryHover = (catId, catType) => {
      this.hoveredCategory = catId;
      if (catType === 'expand') {
        if (this.activeCategory !== catId) {
          this.activeCategory = catId;
        }
      } else {
        if (this.activeCategory !== null) {
          this.activeCategory = null;
        }
      }
      this.renderTwoTierRadialWheel();
    };

    const handleCategoryAction = (catId, catType) => {
      if (catType === 'tool') {
        this.setTool(catId);
        this.hideGtaWheel();
      } else if (catId === 'undo') {
        this.undoLastStroke();
        this.hideGtaWheel();
      } else if (catId === 'clear') {
        this.clearCurrentFrameDrawings();
        this.hideGtaWheel();
      }
    };

    primaryWedges.forEach(w => {
      w.addEventListener('mouseenter', () => handleCategoryHover(w.dataset.cat, w.dataset.type));
      w.addEventListener('mouseleave', () => {
        if (this.hoveredCategory === w.dataset.cat) {
          this.hoveredCategory = null;
          this.renderTwoTierRadialWheel();
        }
      });

      w.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleCategoryAction(w.dataset.cat, w.dataset.type);
      });
    });

    // Sub-Menu Option Event Listeners
    const swatchItems = this.submenuContainer.querySelectorAll('[data-opt-color]');
    swatchItems.forEach(item => {
      item.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.strokeColor = item.dataset.optColor;
        this.saveGlobalState();
        this.hideGtaWheel();
      });
    });

    const sizeItems = this.submenuContainer.querySelectorAll('[data-opt-size]');
    sizeItems.forEach(item => {
      item.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.strokeWidth = parseInt(item.dataset.optSize, 10);
        this.saveGlobalState();
        this.hideGtaWheel();
      });
    });
  }

  // --- Right-Click Context Menu / GTA Wheel Trigger ---
  bindGtaRadialWheel() {
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showGtaWheel(e.clientX, e.clientY);
    });

    document.addEventListener('pointerdown', (e) => {
      if (this.gtaWheel && !this.gtaWheel.contains(e.target) && !this.gtaWheel.classList.contains('hidden')) {
        this.hideGtaWheel();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideGtaWheel();
    });
  }

  showGtaWheel(x, y) {
    const wheelSize = 300;
    const posX = Math.max(wheelSize / 2 + 10, Math.min(window.innerWidth - wheelSize / 2 - 10, x));
    const posY = Math.max(wheelSize / 2 + 10, Math.min(window.innerHeight - wheelSize / 2 - 10, y));

    this.gtaWheel.style.left = `${posX}px`;
    this.gtaWheel.style.top = `${posY}px`;
    this.activeCategory = null;
    this.hoveredCategory = null;
    this.renderTwoTierRadialWheel();
    this.gtaWheel.classList.remove('hidden');
  }

  hideGtaWheel() {
    this.activeCategory = null;
    this.hoveredCategory = null;
    this.gtaWheel.classList.add('hidden');
  }

  async loadGlobalManifest() {
    try {
      const res = await fetch('/api/manifest');
      if (!res.ok) throw new Error('Global manifest error');
      this.manifest = await res.json();
      this.renderAnimationCards();
    } catch (e) {
      console.error('Failed to load global manifest:', e);
    }
  }

  renderAnimationCards() {
    this.cardsList.innerHTML = '';
    if (!this.manifest || !this.manifest.topics || this.manifest.topics.length === 0) {
      this.cardsList.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:1rem;">No animation videos available.</div>';
      return;
    }

    this.manifest.topics.forEach(topic => {
      const card = document.createElement('div');
      card.className = `anim-card ${this.activeWidget && this.activeWidget.topicMeta.id === topic.id ? 'active' : ''}`;
      card.setAttribute('draggable', 'true');
      
      card.innerHTML = `
        <div class="card-title">${topic.title}</div>
        <div class="card-meta">
          <span class="badge">${topic.total_frames} Frames</span>
          <span class="badge">${topic.fps || 15} FPS</span>
        </div>
        <button class="btn-play-card">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>Drag or Click to Add</span>
        </button>
      `;

      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', topic.id);
        e.dataTransfer.effectAllowed = 'copy';
      });

      card.addEventListener('click', () => {
        this.spawnVideoWidget(topic);
        this.closeDrawer();
      });

      this.cardsList.appendChild(card);
    });
  }

  bindDragAndDrop() {
    this.workspace.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.workspace.classList.add('drag-over-board');
    });

    this.workspace.addEventListener('dragleave', () => {
      this.workspace.classList.remove('drag-over-board');
    });

    this.workspace.addEventListener('drop', (e) => {
      e.preventDefault();
      this.workspace.classList.remove('drag-over-board');

      const topicId = e.dataTransfer.getData('text/plain');
      if (topicId && this.manifest && this.manifest.topics) {
        const topicMeta = this.manifest.topics.find(t => t.id === topicId);
        if (topicMeta) {
          const dropW = Math.min(640, window.innerWidth * 0.55);
          const dropH = Math.min(380, dropW * (9 / 16));
          
          const world = this.screenToWorld(e.clientX - dropW / 2, e.clientY - dropH / 2);

          this.spawnVideoWidget(topicMeta, 0, { x: world.x, y: world.y, width: dropW, height: dropH });
          this.closeDrawer();
        }
      }
    });
  }

  async loadGlobalState() {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const savedState = await res.json();
        if (savedState.strokeColor) this.strokeColor = savedState.strokeColor;
        if (savedState.strokeWidth) this.strokeWidth = savedState.strokeWidth;
        if (savedState.activeTool) this.setTool(savedState.activeTool);
        if (typeof savedState.panX === 'number') this.panX = savedState.panX;
        if (typeof savedState.panY === 'number') this.panY = savedState.panY;
        if (typeof savedState.zoom === 'number') this.zoom = savedState.zoom;

        this.updateCameraTransform();

        if (savedState.activeTopic && this.manifest.topics.some(t => t.id === savedState.activeTopic)) {
          const topicMeta = this.manifest.topics.find(t => t.id === savedState.activeTopic);
          this.spawnVideoWidget(topicMeta, savedState.currentFrame || 0, savedState.widgetPos);
        } else {
          this.loadTopicAnnotations('board');
        }
      }
    } catch (e) {}
  }

  async spawnVideoWidget(topicMeta, initialFrame = 0, initialPos = null) {
    if (this.activeWidget) {
      this.activeWidget.destroy();
    }

    await this.loadTopicAnnotations(topicMeta.id);
    this.activeWidget = new VideoWidget(this, topicMeta, initialFrame, initialPos);
    this.renderAnimationCards();
    this.saveGlobalState();
  }

  bindDrawerEvents() {
    this.toggleAnimBtn.addEventListener('click', () => {
      const isOpen = this.animDrawer.classList.contains('open');
      if (isOpen) this.closeDrawer();
      else this.openDrawer();
    });

    this.closeDrawerBtn.addEventListener('click', () => this.closeDrawer());
  }

  openDrawer() {
    this.animDrawer.classList.add('open');
    this.toggleAnimBtn.classList.add('shifted');
    this.arrowIcon.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
  }

  closeDrawer() {
    this.animDrawer.classList.remove('open');
    this.toggleAnimBtn.classList.remove('shifted');
    this.arrowIcon.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>';
  }

  resizeCanvases() {
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    // HiDPI Ultra-High Pixel Buffer Sizing
    this.drawCanvas.width = Math.round(w * dpr);
    this.drawCanvas.height = Math.round(h * dpr);
    this.drawCanvas.style.width = `${w}px`;
    this.drawCanvas.style.height = `${h}px`;

    this.updateCameraTransform();
    if (this.activeWidget) {
      this.activeWidget.resizeCanvas();
    }
  }

  // --- JSON Persistence ---
  async saveGlobalState() {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeTopic: this.activeWidget ? this.activeWidget.topicMeta.id : null,
          currentFrame: this.activeWidget ? this.activeWidget.currentFrameIdx : 0,
          widgetPos: this.activeWidget ? this.activeWidget.pos : null,
          activeTool: this.activeTool,
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth,
          panX: this.panX,
          panY: this.panY,
          zoom: this.zoom
        })
      });
    } catch (e) {}
  }

  async loadTopicAnnotations(topicId) {
    try {
      const res = await fetch(`/api/annotations/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.boardStrokes)) {
          this.boardStrokes = data.boardStrokes;
        } else if (data.frames) {
          this.boardStrokes = Object.values(data.frames).flat();
        } else {
          this.boardStrokes = [];
        }
      } else {
        this.boardStrokes = [];
      }
    } catch (e) {
      this.boardStrokes = [];
    }
    this.redrawDrawingCanvas();
  }

  async saveTopicAnnotations() {
    const topicId = this.activeWidget ? this.activeWidget.topicMeta.id : 'board';
    try {
      await fetch(`/api/annotations/${topicId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardStrokes: this.boardStrokes })
      });
    } catch (e) {}
  }

  // --- Comprehensive Keyboard Shortcuts & Player Control Suite ---
  bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (!this.activeWidget) return;

      const k = e.key.toLowerCase();

      switch (k) {
        case ' ':
        case 'k':
          e.preventDefault();
          this.activeWidget.togglePlayPause();
          this.activeWidget.triggerPlayFlash();
          break;
        case 'arrowleft':
          e.preventDefault();
          this.activeWidget.currentFrameIdx = Math.max(0, this.activeWidget.currentFrameIdx - 1);
          this.activeWidget.renderFrame(this.activeWidget.currentFrameIdx);
          this.activeWidget.updateDisplay();
          break;
        case 'arrowright':
          e.preventDefault();
          this.activeWidget.currentFrameIdx = Math.min(this.activeWidget.totalFrames - 1, this.activeWidget.currentFrameIdx + 1);
          this.activeWidget.renderFrame(this.activeWidget.currentFrameIdx);
          this.activeWidget.updateDisplay();
          break;
        case 'arrowdown':
        case 'j':
          e.preventDefault();
          this.activeWidget.currentFrameIdx = Math.max(0, this.activeWidget.currentFrameIdx - 5);
          this.activeWidget.renderFrame(this.activeWidget.currentFrameIdx);
          this.activeWidget.updateDisplay();
          break;
        case 'arrowup':
        case 'l':
          e.preventDefault();
          this.activeWidget.currentFrameIdx = Math.min(this.activeWidget.totalFrames - 1, this.activeWidget.currentFrameIdx + 5);
          this.activeWidget.renderFrame(this.activeWidget.currentFrameIdx);
          this.activeWidget.updateDisplay();
          break;
        case 'home':
        case '0':
          e.preventDefault();
          this.activeWidget.currentFrameIdx = 0;
          this.activeWidget.renderFrame(0);
          this.activeWidget.updateDisplay();
          break;
        case 'end':
          e.preventDefault();
          this.activeWidget.currentFrameIdx = Math.max(0, this.activeWidget.totalFrames - 1);
          this.activeWidget.renderFrame(this.activeWidget.currentFrameIdx);
          this.activeWidget.updateDisplay();
          break;
      }
    });
  }

  // --- Drawing & Panning Suite ---
  bindDrawingEvents() {
    this.drawCanvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.drawCanvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.drawCanvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.drawCanvas.addEventListener('pointerleave', () => {
      if (this.isDrawing || this.isPanning) this.onPointerUp();
    });
  }

  setTool(toolId) {
    this.activeTool = toolId;
    this.drawCanvas.className = `mode-${toolId}`;

    // Dynamic Z-Index for Drawing ON TOP of Video
    if (toolId === 'select') {
      this.drawCanvas.style.zIndex = '10';
      this.drawCanvas.style.pointerEvents = 'none';
    } else {
      this.drawCanvas.style.zIndex = '30';
      this.drawCanvas.style.pointerEvents = 'auto';
    }

    this.saveGlobalState();
  }

  onPointerDown(e) {
    // 1. Pan Trigger: Spacebar pressed OR Middle mouse button (button === 1) OR Select tool on empty space
    if (this.isSpacePressed || e.button === 1 || this.activeTool === 'select') {
      this.isPanning = true;
      this.panStartX = e.clientX - this.panX;
      this.panStartY = e.clientY - this.panY;
      this.workspace.classList.add('is-panning-active');
      return;
    }

    if (this.activeWidget && this.activeWidget.isPlaying) {
      this.activeWidget.pause();
    }

    // Convert Screen Pointer to World Coordinates
    const world = this.screenToWorld(e.clientX, e.clientY);

    if (this.activeTool === 'pen') {
      this.isDrawing = true;
      this.currentStroke = {
        type: 'stroke',
        color: this.strokeColor,
        width: this.strokeWidth,
        points: [world]
      };
    } else if (this.activeTool === 'text') {
      this.createInlineTextInput(e.clientX, e.clientY, world.x, world.y);
    } else if (this.activeTool === 'eraser') {
      this.isDrawing = true;
      this.eraseStrokesNear(world);
    }
  }

  createInlineTextInput(clientX, clientY, worldX, worldY) {
    const existingInput = document.querySelector('.board-text-input');
    if (existingInput) existingInput.remove();

    const fontSize = (this.strokeWidth === 2 ? 18 : (this.strokeWidth === 4 ? 24 : 32)) * this.zoom;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'board-text-input';
    input.placeholder = 'Type text...';
    input.style.left = `${clientX}px`;
    input.style.top = `${clientY - fontSize / 2}px`;
    input.style.color = this.strokeColor;
    input.style.fontSize = `${fontSize}px`;

    this.workspace.appendChild(input);
    setTimeout(() => input.focus(), 10);

    const commitText = () => {
      const val = input.value.trim();
      if (val) {
        this.boardStrokes.push({
          type: 'text',
          text: val,
          x: worldX,
          y: worldY,
          color: this.strokeColor,
          fontSize: this.strokeWidth === 2 ? 18 : (this.strokeWidth === 4 ? 24 : 32)
        });
        this.redrawDrawingCanvas();
        this.saveTopicAnnotations();
      }
      input.remove();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitText();
      } else if (e.key === 'Escape') {
        input.remove();
      }
    });

    input.addEventListener('blur', () => {
      commitText();
    });
  }

  onPointerMove(e) {
    if (this.isPanning) {
      this.panX = e.clientX - this.panStartX;
      this.panY = e.clientY - this.panStartY;
      this.updateCameraTransform();
      return;
    }

    if (!this.isDrawing) return;

    const world = this.screenToWorld(e.clientX, e.clientY);

    if (this.activeTool === 'pen') {
      this.currentStroke.points.push(world);
      this.redrawDrawingCanvas();
    } else if (this.activeTool === 'eraser') {
      this.eraseStrokesNear(world);
    }
  }

  onPointerUp(e) {
    if (this.isPanning) {
      this.isPanning = false;
      this.workspace.classList.remove('is-panning-active');
      this.saveGlobalState();
      return;
    }

    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.activeTool === 'pen' && this.currentStroke && this.currentStroke.points.length > 1) {
      this.boardStrokes.push(this.currentStroke);
      this.saveTopicAnnotations();
    }
    this.currentStroke = null;
    this.redrawDrawingCanvas();
  }

  eraseStrokesNear(worldPos) {
    if (this.boardStrokes.length === 0) return;

    const eraseRadius = 24 / this.zoom;
    const remaining = this.boardStrokes.filter(item => {
      if (item.type === 'text') {
        const dist = Math.hypot(item.x - worldPos.x, item.y - worldPos.y);
        return dist > eraseRadius + (item.fontSize || 20);
      } else if (item.points) {
        return !item.points.some(pt => {
          const dist = Math.hypot(pt.x - worldPos.x, pt.y - worldPos.y);
          return dist <= eraseRadius;
        });
      }
      return true;
    });

    if (remaining.length !== this.boardStrokes.length) {
      this.boardStrokes = remaining;
      this.redrawDrawingCanvas();
      this.saveTopicAnnotations();
    }
  }

  undoLastStroke() {
    if (this.boardStrokes.length > 0) {
      this.boardStrokes.pop();
      this.redrawDrawingCanvas();
      this.saveTopicAnnotations();
    }
  }

  clearCurrentFrameDrawings() {
    this.boardStrokes = [];
    this.redrawDrawingCanvas();
    this.saveTopicAnnotations();
  }

  redrawDrawingCanvas() {
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    // Reset Transform & Clear Physical Pixels
    this.drawCtx.save();
    this.drawCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    this.drawCtx.restore();

    // Apply Ultra-Sharp HiDPI + Camera World Transformation
    this.drawCtx.save();
    this.drawCtx.setTransform(
      this.zoom * dpr, 
      0, 
      0, 
      this.zoom * dpr, 
      this.panX * dpr, 
      this.panY * dpr
    );

    // High Quality Line Anti-Aliasing Configuration
    this.drawCtx.imageSmoothingEnabled = true;
    this.drawCtx.imageSmoothingQuality = 'high';

    this.boardStrokes.forEach(item => {
      if (item.type === 'text') {
        this.renderTextItem(item);
      } else {
        this.renderStroke(item);
      }
    });

    if (this.currentStroke) {
      this.renderStroke(this.currentStroke);
    }

    this.drawCtx.restore();
  }

  renderStroke(stroke) {
    if (!stroke || !stroke.points || stroke.points.length < 2) return;

    this.drawCtx.save();
    this.drawCtx.beginPath();
    this.drawCtx.strokeStyle = stroke.color;
    this.drawCtx.lineWidth = stroke.width;
    this.drawCtx.lineCap = 'round';
    this.drawCtx.lineJoin = 'round';

    this.drawCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      this.drawCtx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    this.drawCtx.stroke();
    this.drawCtx.restore();
  }

  renderTextItem(item) {
    if (!item || !item.text) return;

    this.drawCtx.save();
    this.drawCtx.fillStyle = item.color || '#ef4444';
    this.drawCtx.font = `600 ${item.fontSize || 24}px 'Poppins', -apple-system, sans-serif`;
    this.drawCtx.textBaseline = 'middle';
    this.drawCtx.fillText(item.text, item.x, item.y);
    this.drawCtx.restore();
  }

  showOverlay() {
    this.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.player = new FramePlayer();
});
