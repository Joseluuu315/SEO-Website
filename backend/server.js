const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Función para validar la URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Endpoint para scrapeo
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'URL inválida. Por favor, ingresa una URL válida.' });
  }

  console.log('URL recibida:', url);

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const html = response.data;
    const $ = cheerio.load(html);

    // Extraer título, descripción y otros metadatos
    const title = $('title').text() || 'No se encontró título';
    const description = $('meta[name="description"]').attr('content') || 'No se encontró descripción';
    const keywordsMeta = $('meta[name="keywords"]').attr('content');
    const keywords = keywordsMeta ? keywordsMeta.split(',').map(k => k.trim()) : [];

    // Contadores de encabezados
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    const imageCount = $('img').length;

    // Contar enlaces internos y externos
    const allLinks = $('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;
    const baseUrl = new URL(url);

    allLinks.each((_, link) => {
      const href = $(link).attr('href');
      if (href) {
        if (href.startsWith('/') || href.includes(baseUrl.hostname)) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      }
    });

    // Conteo de palabras
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(' ').filter(word => word.length > 0).length;

    // Simulación de backlinks y tráfico
    const backlinks = Math.floor(Math.random() * 100);
    const traffic = Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000));

    res.json({
      url,
      title,
      description,
      keywords,
      h1Count,
      h2Count,
      h3Count,
      imageCount,
      internalLinks,
      externalLinks,
      wordCount,
      backlinks,
      traffic,
    });

  } catch (error) {
    console.error(error.message);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'No se pudo acceder a la URL. Verifica si la página está activa.' });
    }
    res.status(500).json({ error: 'Error al analizar la URL. Asegúrate de que es válida y accesible.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
});
