const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static assets for the Player UI
app.use(express.static(path.join(__dirname, 'player')));

// Serve static frame animations with CORS headers
app.use('/animations', express.static(path.join(__dirname, 'animations')));

// API endpoint to fetch global animation manifest
app.get('/api/manifest', (req, res) => {
  const manifestPath = path.join(__dirname, 'animations', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    res.sendFile(manifestPath);
  } else {
    res.json({ topics: [] });
  }
});

// API endpoint to fetch specific topic manifest
app.get('/api/topics/:id', (req, res) => {
  const topicId = req.params.id;
  const topicManifestPath = path.join(__dirname, 'animations', topicId, 'manifest.json');
  if (fs.existsSync(topicManifestPath)) {
    res.sendFile(topicManifestPath);
  } else {
    res.status(404).json({ error: `Topic '${topicId}' manifest not found` });
  }
});

// API: Get global player state (active topic, frame, tool selection)
app.get('/api/state', (req, res) => {
  const statePath = path.join(__dirname, 'animations', 'state.json');
  if (fs.existsSync(statePath)) {
    try {
      const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      return res.json(stateData);
    } catch (e) {}
  }
  res.json({ activeTopic: 'binary_search', currentFrame: 0, speed: 1.0, activeTool: 'select' });
});

// API: Save global player state to state.json
app.post('/api/state', (req, res) => {
  const statePath = path.join(__dirname, 'animations', 'state.json');
  const newState = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(statePath, JSON.stringify(newState, null, 2));
  res.json({ success: true, state: newState });
});

// API: Get topic annotations (drawings per frame)
app.get('/api/annotations/:topic', (req, res) => {
  const topicId = req.params.topic;
  const annotPath = path.join(__dirname, 'animations', topicId, 'annotations.json');
  if (fs.existsSync(annotPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(annotPath, 'utf8'));
      return res.json(data);
    } catch (e) {}
  }
  res.json({ topic: topicId, frames: {} });
});

// API: Save topic annotations to annotations.json
app.post('/api/annotations/:topic', (req, res) => {
  const topicId = req.params.topic;
  const topicDir = path.join(__dirname, 'animations', topicId);
  
  if (!fs.existsSync(topicDir)) {
    fs.mkdirSync(topicDir, { recursive: true });
  }
  
  const annotPath = path.join(topicDir, 'annotations.json');
  const annotData = {
    topic: topicId,
    updatedAt: new Date().toISOString(),
    frames: req.body.frames || {}
  };
  
  fs.writeFileSync(annotPath, JSON.stringify(annotData, null, 2));
  res.json({ success: true, savedFrames: Object.keys(annotData.frames).length });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Universal Frame Animation Server is running!`);
  console.log(`🌐 Open Player: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
