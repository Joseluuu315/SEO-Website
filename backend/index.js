const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ENDPOINT API ✅
app.post('/api/scrape', (req, res) => {
  const { url } = req.body;

  console.log('URL recibida:', url);

  // Ejemplo de respuesta mock
  const fakeData = {
    url: url,
    title: 'Título de prueba',
    keywords: ['seo', 'optimización', 'prueba'],
    backlinks: 42,
    traffic: [100, 200, 300, 400, 500]
  };

  res.json(fakeData);
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
