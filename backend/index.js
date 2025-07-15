const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  console.log('URL recibida:', url);

  try {
    const browser = await puppeteer.launch({
      headless: 'new', // Usa headless:true o 'new'
      args: ['--no-sandbox'] // En hosting a veces es necesario
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

    const result = await page.evaluate(() => {
      const title = document.title || 'No title';
      const description = document.querySelector('meta[name="description"]')?.content || 'No description';
      const keywordsMeta = document.querySelector('meta[name="keywords"]')?.content || '';
      const keywords = keywordsMeta ? keywordsMeta.split(',').map(k => k.trim()) : [];
      const h1Count = document.querySelectorAll('h1').length;
      const h2Count = document.querySelectorAll('h2').length;
      const h3Count = document.querySelectorAll('h3').length;
      const imageCount = document.querySelectorAll('img').length;

      const allLinks = document.querySelectorAll('a[href]');
      let internalLinks = 0;
      let externalLinks = 0;
      allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      });

      const bodyText = document.body.innerText.replace(/\s+/g, ' ').trim();
      const wordCount = bodyText.split(' ').filter(w => w.length > 0).length;

      return {
        title,
        description,
        keywords,
        h1Count,
        h2Count,
        h3Count,
        imageCount,
        internalLinks,
        externalLinks,
        wordCount
      };
    });

    await browser.close();

    // Generar backlinks y tráfico fake
    const backlinks = Math.floor(Math.random() * 100);
    const traffic = Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000));

    res.json({
      url,
      ...result,
      backlinks,
      traffic
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al analizar la URL. Puede estar protegida o tardar mucho en cargar.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
});
