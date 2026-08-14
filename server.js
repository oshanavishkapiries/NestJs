const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

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

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Universal Frame Animation Server is running!`);
  console.log(`🌐 Open Player: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
