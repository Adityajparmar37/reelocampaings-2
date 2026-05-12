const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all routes
// This ensures hard refresh works on any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Frontend] Server running on port ${PORT}`);
  console.log(`[Frontend] Serving from: ${path.join(__dirname, 'dist')}`);
});
