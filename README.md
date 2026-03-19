# ⚡ SEOPro — Analizador SEO Profesional

Una plataforma de análisis SEO full-stack con autenticación, puntuación automática y detección de problemas.

---

## 🗂 Estructura del proyecto

```
seo-analyzer/
├── backend/
│   ├── server.js          ← Servidor Express + API + Auth + Scraping
│   ├── package.json
│   └── .env
└── frontend/
    ├── public/
    └── src/
        ├── App.js                    ← Router principal
        ├── index.js
        ├── index.css
        ├── context/
        │   └── AuthContext.js        ← Estado global de autenticación
        └── pages/
            ├── Login.js              ← Página de login
            ├── Register.js           ← Página de registro
            ├── Auth.css              ← Estilos de auth
            ├── Dashboard.js          ← Panel principal de análisis
            └── Dashboard.css         ← Estilos del dashboard
```

---

## 🚀 Instalación y puesta en marcha

### 1. Backend

```bash
cd backend
npm install
```

Edita el archivo `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/seoanalyzer
JWT_SECRET=tu_clave_secreta_muy_segura
```

```bash
npm run dev    # desarrollo (con nodemon)
npm start      # producción
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

El frontend tiene configurado `"proxy": "http://localhost:5000"` en `package.json`, por lo que las llamadas a `/api/*` se redirigen automáticamente al backend.

---

## ✨ Funcionalidades

### Autenticación
- Registro con username, email y contraseña
- Login con JWT (7 días de duración)
- Rutas protegidas — el dashboard requiere login
- Sesión persistente en localStorage

### Análisis SEO
- **Puntuación SEO** (0–100) calculada automáticamente
- **Metadatos**: título, descripción, canonical, OG tags, robots, viewport, lang, charset
- **Encabezados**: conteo de H1, H2, H3 + texto del primer H1
- **Imágenes**: total y cuántas tienen atributo `alt`
- **Contenido**: conteo de palabras
- **Enlaces**: internos, externos y backlinks estimados
- **Técnico**: HTTPS, Schema.org, canonical, viewport
- **Open Graph**: og:title, og:description, og:image
- **Problemas priorizados**: alta, media y baja severidad
- **Tráfico estimado**: gráfico de área de los últimos 6 meses
- **Guardado de historial** en MongoDB (si el usuario está autenticado)

### UI/UX
- Diseño dark mode profesional
- Sidebar de navegación
- 4 tabs: Resumen, Técnico, Contenido, Problemas
- Ring de puntuación animado
- Responsive (mobile-friendly)
- Animaciones suaves

---

## 🛠 Stack tecnológico

**Backend**: Node.js, Express, Mongoose (MongoDB), Cheerio, Axios, JWT, Bcrypt  
**Frontend**: React 18, React Router v6, Recharts, React Icons

---

## 🔑 Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default: 5000) |
| `MONGO_URI` | URI de conexión MongoDB Atlas |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |

---

## 📦 Dependencias backend

```json
{
  "axios": "^1.6.0",
  "bcryptjs": "^2.4.3",
  "cheerio": "^1.0.0-rc.12",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.0",
  "mongoose": "^7.5.0"
}
```