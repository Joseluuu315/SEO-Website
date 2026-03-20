const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
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

app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan('tiny'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/seoanalyzer';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 4000,
  connectTimeoutMS: 4000,
}).then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ─── Models ──────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['trial', 'paid', 'admin'], default: 'trial' },
  temporaryUntil: { type: Date, default: null },
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
  issues: [
    new mongoose.Schema(
      {
        type: { type: String },
        severity: { type: String },
        message: { type: String },
      },
      { _id: false }
    ),
  ],
  aiReport: { type: String, default: null },
  aiModel: { type: String, default: null },
  aiCreatedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});
const Analysis = mongoose.model('Analysis', AnalysisSchema);

const SiteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  url: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const Site = mongoose.model('Site', SiteSchema);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;

const buildFallbackAiReport = (result) => {
  const topIssues = Array.isArray(result.issues) ? result.issues.slice(0, 8) : [];
  const issuesText = topIssues.length
    ? topIssues.map(i => `- [${i.severity}] ${i.message}`).join('\n')
    : '- Sin issues detectados por el scanner.';

  return [
    `Informe SEO (modo sin IA)`,
    `URL: ${result.url}`,
    `Score: ${result.seoScore}`,
    '',
    'Resumen rápido:',
    `- Title: ${result.title}`,
    `- Meta description: ${result.description}`,
    `- H1/H2/H3: ${result.h1Count}/${result.h2Count}/${result.h3Count}`,
    `- Palabras: ${result.wordCount}`,
    `- Imágenes con alt: ${result.imagesWithAlt}/${result.imageCount}`,
    `- Links internos/externos: ${result.internalLinks}/${result.externalLinks}`,
    '',
    'Issues principales:',
    issuesText,
    '',
    'Recomendaciones rápidas:',
    '- Ajusta Title a 50-60 caracteres y Description a 150-160 (si aplica).',
    '- Asegura 1 solo H1 y estructura H2/H3 coherente.',
    '- Sube el contenido por encima de 300 palabras si es bajo.',
    '- Añade alt a imágenes clave y mejora enlaces internos.',
  ].join('\n');
};

const generateAiSeoReport = async ({ url, result }) => {
  if (!OPENAI_API_KEY) {
    return { report: buildFallbackAiReport(result), model: 'fallback' };
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const prompt = [
    'Eres un consultor SEO senior. Genera un informe experto y accionable en español.',
    'Formato estricto:',
    '1) Resumen ejecutivo (5-7 líneas)',
    '2) Puntuación y explicación',
    '3) Prioridades (P0/P1/P2) con impacto y esfuerzo',
    '4) Checklist técnico (meta, headings, contenido, imágenes, enlaces, schema, canonical, robots, https)',
    '5) Quick wins (hoy)',
    '6) Plan 7 días',
    '7) Plan 30 días',
    '',
    `URL analizada: ${url}`,
    'Datos del análisis automático (JSON):',
    JSON.stringify(result, null, 2),
  ].join('\n');

  let response;
  try {
    response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: 'Eres un experto SEO técnico y de contenido. Sé específico y práctico.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.error?.message || err?.response?.data || err?.message;
    const e = new Error(`OpenAI error${status ? ` (${status})` : ''}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
    e.status = status || 502;
    throw e;
  }

  const report = response?.data?.choices?.[0]?.message?.content;
  if (!report) {
    return { report: buildFallbackAiReport(result), model: 'fallback' };
  }
  return { report, model };
};

const scrapeUrl = async (url) => {
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

  return {
    url, title, description, keywords,
    canonical, ogTitle, ogDescription, ogImage,
    robots, viewport, charset, lang,
    h1Count, h2Count, h3Count, h1Text,
    imageCount, imagesWithAlt,
    internalLinks, externalLinks, wordCount,
    hasSchema, hasSitemap, hasHttps,
    backlinks, traffic, seoScore, issues,
  };
};

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
    const role = email === 'joselufupa2016@gmail.com' ? 'admin' : 'trial';
    const user = await User.create({ username, email, password: hashed, role });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch {
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
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ─── Profile Management ─────────────────────────────────────────────────
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    if (!currentPassword && (newPassword || username !== req.user.username || email !== req.user.email)) {
      return res.status(400).json({ error: 'Debes introducir tu contraseña actual para guardar cambios' });
    }
    const payload = {};
    if (username !== req.user.username) payload.username = username;
    if (email !== req.user.email) payload.email = email;
    if (newPassword) payload.password = await bcrypt.hash(newPassword, 12);
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'No hay cambios que guardar' });
    }
    // Verify current password before any change
    if (currentPassword) {
      const user = await User.findById(req.user.id);
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }
    }
    const updated = await User.findByIdAndUpdate(req.user.id, payload, { new: true });
    res.json({ message: 'Perfil actualizado', user: { id: updated._id, username: updated.username, email: updated.email, role: updated.role } });
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// ─── Sites Routes ─────────────────────────────────────────────────
app.get('/api/sites', authMiddleware, async (req, res) => {
  try {
    const sites = await Site.find({ userId: req.user.id });
    res.json(sites);
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo sitios' });
  }
});

app.post('/api/sites', authMiddleware, async (req, res) => {
  try {
    const { name, url, notes } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'Nombre y URL obligatorios' });
    const site = await Site.create({ userId: req.user.id, name, url, notes });
    res.status(201).json(site);
  } catch (e) {
    res.status(500).json({ error: 'Error creando sitio' });
  }
});

app.put('/api/sites/:id', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user.id });
    if (!site) return res.status(404).json({ error: 'Sitio no encontrado' });
    const { name, url, notes } = req.body;
    Object.assign(site, { name, url, notes });
    await site.save();
    res.json(site);
  } catch (e) {
    res.status(500).json({ error: 'Error actualizando sitio' });
  }
});

app.delete('/api/sites/:id', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user.id });
    if (!site) return res.status(404).json({ error: 'Sitio no encontrado' });
    await Analysis.deleteMany({ userId: req.user.id, url: site.url });
    await Site.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error eliminando sitio' });
  }
});

// ─── User Preferences Schema ───────────────────────────────────────────────
const PreferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
  defaultAiModel: { type: String, enum: ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet'], default: 'gpt-4o-mini' },
  exportFormat: { type: String, enum: ['pdf', 'csv', 'json'], default: 'pdf' },
  notifications: { type: Boolean, default: true },
  autoSave: { type: Boolean, default: true },
  language: { type: String, enum: ['es', 'en', 'pt'], default: 'es' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Preferences = mongoose.model('Preferences', PreferencesSchema);

// ─── Preferences Routes ───────────────────────────────────────────────────────
app.get('/api/preferences', authMiddleware, async (req, res) => {
  try {
    let userPrefs = await Preferences.findOne({ userId: req.user.id });
    if (!userPrefs) {
      // Create default preferences for user
      userPrefs = await Preferences.create({
        userId: req.user.id,
        theme: 'dark',
        defaultAiModel: 'gpt-4o-mini',
        exportFormat: 'pdf',
        notifications: true,
        autoSave: true,
        language: 'es'
      });
    }
    res.json({ preferences: userPrefs });
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo preferencias' });
  }
});

app.put('/api/preferences', authMiddleware, async (req, res) => {
  try {
    const { theme, defaultAiModel, exportFormat, notifications, autoSave, language } = req.body;
    
    let userPrefs = await Preferences.findOne({ userId: req.user.id });
    if (!userPrefs) {
      // Create if doesn't exist
      userPrefs = await Preferences.create({
        userId: req.user.id,
        theme: theme || 'dark',
        defaultAiModel: defaultAiModel || 'gpt-4o-mini',
        exportFormat: exportFormat || 'pdf',
        notifications: notifications !== undefined ? notifications : true,
        autoSave: autoSave !== undefined ? autoSave : true,
        language: language || 'es'
      });
    } else {
      // Update existing
      if (theme !== undefined) userPrefs.theme = theme;
      if (defaultAiModel !== undefined) userPrefs.defaultAiModel = defaultAiModel;
      if (exportFormat !== undefined) userPrefs.exportFormat = exportFormat;
      if (notifications !== undefined) userPrefs.notifications = notifications;
      if (autoSave !== undefined) userPrefs.autoSave = autoSave;
      if (language !== undefined) userPrefs.language = language;
      userPrefs.updatedAt = new Date();
      await userPrefs.save();
    }
    
    res.json({ message: 'Preferencias guardadas', preferences: userPrefs });
  } catch (e) {
    res.status(500).json({ error: 'Error guardando preferencias' });
  }
});

// ─── Admin Management Schema ───────────────────────────────────────────────
const AdminActionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['CREATE_USER', 'DELETE_USER', 'UPDATE_ROLE', 'UPDATE_USER', 'SEND_EMAIL', 'TEMP_ROLE'], required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});
const AdminAction = mongoose.model('AdminAction', AdminActionSchema);

// ─── Admin Routes ───────────────────────────────────────────────────────
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

app.post('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const { username, email, password, role, temporaryUntil } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email y password son requeridos' });
    }
    
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: 'El usuario o email ya existe' });
    
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      username, 
      email, 
      password: hashed, 
      role: role || 'trial',
      temporaryUntil: temporaryUntil ? new Date(temporaryUntil) : null 
    });
    
    // Log admin action
    await AdminAction.create({
      adminId: req.user.id,
      action: 'CREATE_USER',
      targetUserId: user._id,
      details: { username, email, role, temporaryUntil }
    });
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      user: { id: user._id, username: user.username, email: user.email, role: user.role, temporaryUntil: user.temporaryUntil }
    });
  } catch (e) {
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

app.put('/api/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const { username, email, role, temporaryUntil } = req.body;
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const payload = {};
    if (username !== undefined) payload.username = username;
    if (email !== undefined) payload.email = email;
    if (role !== undefined) payload.role = role;
    if (temporaryUntil !== undefined) payload.temporaryUntil = temporaryUntil ? new Date(temporaryUntil) : null;
    
    const updated = await User.findByIdAndUpdate(req.params.id, payload, { new: true });
    
    // Log admin action
    await AdminAction.create({
      adminId: req.user.id,
      action: 'UPDATE_USER',
      targetUserId: targetUser._id,
      details: payload
    });
    
    res.json({ 
      message: 'Usuario actualizado exitosamente',
      user: { id: updated._id, username: updated.username, email: updated.email, role: updated.role, temporaryUntil: updated.temporaryUntil }
    });
  } catch (e) {
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    // Cannot delete yourself
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    
    // Delete user data
    await Analysis.deleteMany({ userId: req.params.id });
    await Site.deleteMany({ userId: req.params.id });
    await Preferences.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    
    // Log admin action
    await AdminAction.create({
      adminId: req.user.id,
      action: 'DELETE_USER',
      targetUserId: targetUser._id,
      details: { username: targetUser.username, email: targetUser.email }
    });
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

app.post('/api/admin/send-email', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const { userId, subject, message } = req.body;
    const targetUser = await User.findById(userId);
    
    if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    // TODO: Implement email sending service
    // For now, just log the action
    await AdminAction.create({
      adminId: req.user.id,
      action: 'SEND_EMAIL',
      targetUserId: targetUser._id,
      details: { subject, message, to: targetUser.email }
    });
    
    res.json({ message: 'Email enviado exitosamente (simulado)' });
  } catch (e) {
    res.status(500).json({ error: 'Error enviando email' });
  }
});

app.get('/api/admin/actions', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const actions = await AdminAction.find({})
      .populate('adminId', 'username')
      .populate('targetUserId', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ actions });
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo acciones' });
  }
});

// ─── Check Temporary Roles (Cron Job Simulation) ───────────────────────────
const checkTemporaryRoles = async () => {
  try {
    const now = new Date();
    const expiredUsers = await User.find({ 
      temporaryUntil: { $lte: now },
      role: { $ne: 'admin' }
    });
    
    for (const user of expiredUsers) {
      await User.findByIdAndUpdate(user._id, { role: 'trial', temporaryUntil: null });
      console.log(`Rol temporal expirado para ${user.username} (${user.email})`);
    }
  } catch (e) {
    console.error('Error checking temporary roles:', e);
  }
};

// Check temporary roles every hour
setInterval(checkTemporaryRoles, 3600000);

// ─── Reports Routes ──────────────────────────────────────────────────────────
app.post('/api/reports/generate', authMiddleware, async (req, res) => {
  try {
    const { template, dateRange } = req.body;
    // TODO: generate PDF report based on template and dateRange
    res.json({ url: 'https://example.com/report.pdf' });
  } catch (e) {
    res.status(500).json({ error: 'Error generando reporte' });
  }
});

// ─── History ─────────────────────────────────────────────────────────────────
app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.query;
    const filter = { userId: req.user.id };
    if (siteId) {
      // Find site by ID to get its URL, then filter analyses by that URL
      const site = await Site.findOne({ _id: siteId, userId: req.user.id });
      if (!site) return res.status(404).json({ error: 'Sitio no encontrado' });
      filter.url = site.url;
    }
    const history = await Analysis.find(filter)
      .sort({ createdAt: -1 }).limit(20)
      .select('url title seoScore createdAt');
    res.json(history);
  } catch {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

app.get('/api/history/:id', authMiddleware, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    if (!analysis) return res.status(404).json({ error: 'Consulta no encontrada' });
    res.json(analysis);
  } catch {
    res.status(400).json({ error: 'ID inválido' });
  }
});

app.post('/api/ai-analyze', authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'URL inválida. Por favor, ingresa una URL válida.' });
  }

  try {
    const result = await scrapeUrl(url);

    let aiReport = null;
    let aiModel = null;
    try {
      const ai = await generateAiSeoReport({ url, result });
      aiReport = ai.report;
      aiModel = ai.model;
    } catch (err) {
      const status = err?.status;
      if (status === 429) {
        aiReport = buildFallbackAiReport(result);
        aiModel = 'fallback_quota';
      } else {
        console.error('❌ AI report error:', err?.message || err);
        return res.status(status || 502).json({ error: err?.message || 'Error generando informe IA' });
      }
    }

    const saved = await Analysis.create({
      ...result,
      userId: req.user.id,
      aiReport,
      aiModel,
      aiCreatedAt: new Date(),
    });

    res.json({ ...result, aiReport, aiModel, _id: saved._id });
  } catch (error) {
    if (error.response?.status === 404)
      return res.status(404).json({ error: 'Página no encontrada (404). Verifica la URL.' });
    if (error.code === 'ECONNABORTED')
      return res.status(408).json({ error: 'Tiempo de espera agotado. La página tardó demasiado.' });
    res.status(500).json({ error: 'No se pudo analizar la URL con IA.' });
  }
});

app.post('/api/ai-report', authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const analysis = await Analysis.findOne({ _id: id, userId: req.user.id });
    if (!analysis) return res.status(404).json({ error: 'Consulta no encontrada' });

    const { report, model } = await generateAiSeoReport({ url: analysis.url, result: analysis.toObject() });
    await Analysis.updateOne({ _id: id }, { aiReport: report, aiModel: model, aiCreatedAt: new Date() });
    res.json({ report, model });
  } catch {
    res.status(500).json({ error: 'Error al generar informe de IA' });
  }
});

// ─── SEO Score Calculator ─────────────────────────────────────────────────────
function calculateSeoScore(data) {
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
}

app.listen(PORT, () => console.log(`✅ Servidor escuchando en http://localhost:${PORT}`));