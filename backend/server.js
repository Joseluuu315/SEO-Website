const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_seo_analyzer_2024';

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/seoanalyzer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ─── Models ──────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

const AnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: String,
  title: String,
  description: String,
  keywords: [String],
  seoScore: Number,
  h1Count: Number, h2Count: Number, h3Count: Number,
  imageCount: Number, wordCount: Number,
  internalLinks: Number, externalLinks: Number,
  backlinks: Number, traffic: [Number],
  issues: [{ type: String, severity: String, message: String }],
  createdAt: { type: Date, default: Date.now },
});
const Analysis = mongoose.model('Analysis', AnalysisSchema);

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: 'El usuario o email ya existe' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashed });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ─── SEO Score Calculator ─────────────────────────────────────────────────────
const calculateSeoScore = (data) => {
  let score = 100;
  const issues = [];

  if (!data.title || data.title === 'No se encontró título') {
    score -= 15; issues.push({ type: 'error', severity: 'high', message: 'Falta el título de la página' });
  } else if (data.title.length < 30) {
    score -= 5; issues.push({ type: 'warning', severity: 'medium', message: `Título demasiado corto (${data.title.length} chars). Recomendado: 50-60` });
  } else if (data.title.length > 60) {
    score -= 5; issues.push({ type: 'warning', severity: 'medium', message: `Título demasiado largo (${data.title.length} chars). Máximo: 60` });
  }

  if (!data.description || data.description === 'No se encontró descripción') {
    score -= 10; issues.push({ type: 'error', severity: 'high', message: 'Falta la meta descripción' });
  } else if (data.description.length < 120) {
    score -= 5; issues.push({ type: 'warning', severity: 'medium', message: `Meta descripción corta (${data.description.length} chars). Recomendado: 150-160` });
  } else if (data.description.length > 160) {
    score -= 5; issues.push({ type: 'warning', severity: 'medium', message: `Meta descripción larga (${data.description.length} chars). Máximo: 160` });
  }

  if (data.h1Count === 0) {
    score -= 10; issues.push({ type: 'error', severity: 'high', message: 'No se encontró ningún H1' });
  } else if (data.h1Count > 1) {
    score -= 5; issues.push({ type: 'warning', severity: 'medium', message: `Múltiples H1 detectados (${data.h1Count}). Usa solo uno` });
  }

  if (data.keywords.length === 0) {
    score -= 5; issues.push({ type: 'info', severity: 'low', message: 'No se encontraron meta keywords' });
  }

  if (data.imageCount > 0 && data.imageCount > data.imagesWithAlt) {
    const missing = data.imageCount - (data.imagesWithAlt || 0);
    score -= Math.min(10, missing * 2);
    issues.push({ type: 'warning', severity: 'medium', message: `${missing} imagen(es) sin atributo alt` });
  }

  if (data.wordCount < 300) {
    score -= 10; issues.push({ type: 'warning', severity: 'high', message: `Contenido escaso (${data.wordCount} palabras). Recomendado: >300` });
  }

  if (data.internalLinks < 3) {
    score -= 5; issues.push({ type: 'info', severity: 'low', message: 'Pocos enlaces internos. Mejora la navegación interna' });
  }

  return { score: Math.max(0, score), issues };
};

// ─── Scrape Endpoint ──────────────────────────────────────────────────────────
const isValidUrl = (string) => {
  try { new URL(string); return true; } catch { return false; }
};

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!isValidUrl(url))
    return res.status(400).json({ error: 'URL inválida. Por favor, ingresa una URL válida.' });

  try {
    const response = await axios.get(url, {
      timeout: 12000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzer/1.0)' }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text().trim() || 'No se encontró título';
    const description = $('meta[name="description"]').attr('content') || 'No se encontró descripción';
    const keywordsMeta = $('meta[name="keywords"]').attr('content');
    const keywords = keywordsMeta ? keywordsMeta.split(',').map(k => k.trim()).filter(Boolean) : [];
    const canonical = $('link[rel="canonical"]').attr('href') || null;
    const ogTitle = $('meta[property="og:title"]').attr('content') || null;
    const ogDescription = $('meta[property="og:description"]').attr('content') || null;
    const ogImage = $('meta[property="og:image"]').attr('content') || null;
    const robots = $('meta[name="robots"]').attr('content') || null;
    const viewport = $('meta[name="viewport"]').attr('content') || null;
    const charset = $('meta[charset]').attr('charset') || 'No detectado';
    const lang = $('html').attr('lang') || 'No detectado';

    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    const h1Text = $('h1').first().text().trim();

    const allImages = $('img');
    const imageCount = allImages.length;
    const imagesWithAlt = allImages.filter((_, el) => $(el).attr('alt') && $(el).attr('alt').trim() !== '').length;

    const baseUrl = new URL(url);
    let internalLinks = 0, externalLinks = 0;
    $('a[href]').each((_, link) => {
      const href = $(link).attr('href');
      if (!href) return;
      if (href.startsWith('/') || href.includes(baseUrl.hostname)) internalLinks++;
      else if (href.startsWith('http')) externalLinks++;
    });

    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(' ').filter(w => w.length > 0).length;

    const hasSchema = html.includes('application/ld+json') || html.includes('itemtype');
    const hasSitemap = html.toLowerCase().includes('sitemap');
    const hasHttps = url.startsWith('https://');

    const backlinks = Math.floor(Math.random() * 500) + 10;
    const traffic = Array.from({ length: 6 }, () => Math.floor(Math.random() * 5000) + 100);

    const rawData = {
      title, description, keywords, h1Count, h2Count, h3Count,
      imageCount, imagesWithAlt, wordCount, internalLinks, externalLinks
    };

    const { score: seoScore, issues } = calculateSeoScore(rawData);

    const result = {
      url, title, description, keywords,
      canonical, ogTitle, ogDescription, ogImage,
      robots, viewport, charset, lang,
      h1Count, h2Count, h3Count, h1Text,
      imageCount, imagesWithAlt,
      internalLinks, externalLinks, wordCount,
      hasSchema, hasSitemap, hasHttps,
      backlinks, traffic, seoScore, issues,
    };

    // Save to DB if user token provided
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        await Analysis.create({ ...result, userId: decoded.id });
      }
    } catch {}

    res.json(result);
  } catch (error) {
    if (error.response?.status === 404)
      return res.status(404).json({ error: 'Página no encontrada (404). Verifica la URL.' });
    if (error.code === 'ECONNABORTED')
      return res.status(408).json({ error: 'Tiempo de espera agotado. La página tardó demasiado.' });
    res.status(500).json({ error: 'No se pudo analizar la URL. Verifica que sea accesible.' });
  }
});

// ─── History ─────────────────────────────────────────────────────────────────
app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(20)
      .select('url title seoScore createdAt');
    res.json(history);
  } catch {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

app.listen(PORT, () => console.log(`✅ Servidor escuchando en http://localhost:${PORT}`));