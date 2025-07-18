import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FaLink, FaHeading, FaImage, FaExternalLinkAlt, FaWordpress, FaChartLine, FaKey, FaListUl } from 'react-icons/fa';

function App() {
  const [url, setUrl] = useState('');
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 

    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    setSeoData(data);
    setLoading(false); 
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="text-gradient mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>🔍 Analizador SEO</h1>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Introduce una URL para analizar métricas SEO clave y mejorar tu sitio web.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <form onSubmit={handleSubmit} className="card shadow-lg p-4 mb-4" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
            <div className="mb-3">
              <label className="form-label fw-bold">URL del sitio web</label>
              <input
                type="url"
                className="form-control shadow-sm"
                style={{ borderRadius: '10px', border: '2px solid #6c757d' }}
                placeholder="https://ejemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 shadow-sm" 
              style={{ borderRadius: '10px', padding: '10px' }}
            >
              {loading ? 'Analizando...' : 'Analizar'}
            </button>
          </form>
        </div>
      </div>

      {seoData && (
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-lg p-4" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
              <h3 className="text-success mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold' }}>
                Resultados para: <span className="text-decoration-underline">{seoData.url}</span>
              </h3>

              <div className="mb-3">
                <h5><FaListUl className="me-2" style={{ color: '#6c757d' }} /> Información General</h5>
                <p><strong>📌 Título:</strong> {seoData.title}</p>
                <p><strong>📝 Descripción:</strong> {seoData.description}</p>
                <p>
                  <strong><FaKey className="me-1" /> Palabras clave:</strong>{' '}
                  {seoData.keywords.length > 0 ? (
                    seoData.keywords.map((kw, i) => (
                      <span key={i} className="badge bg-primary me-1">{kw}</span>
                    ))
                  ) : (
                    <span className="text-muted">No se encontraron palabras clave</span>
                  )}
                </p>
              </div>

              <div className="row text-center">
                <div className="col-md-4 mb-3">
                  <div className="card p-3 shadow-sm" style={{ borderRadius: '12px' }}>
                    <FaHeading className="text-primary mb-2" size={24} />
                    <h6 className="mb-1">Encabezados</h6>
                    <p className="mb-1"><span className="badge bg-primary">H1: {seoData.h1Count}</span></p>
                    <p className="mb-1"><span className="badge bg-info">H2: {seoData.h2Count}</span></p>
                    <p><span className="badge bg-success">H3: {seoData.h3Count}</span></p>
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="card p-3 shadow-sm" style={{ borderRadius: '12px' }}>
                    <FaImage className="text-warning mb-2" size={24} />
                    <h6 className="mb-1">Imágenes</h6>
                    <p className="fs-5 fw-bold">{seoData.imageCount}</p>
                    <FaWordpress className="text-secondary mb-2" size={24} />
                    <h6 className="mb-1">Palabras</h6>
                    <p className="fs-5 fw-bold">{seoData.wordCount}</p>
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="card p-3 shadow-sm" style={{ borderRadius: '12px' }}>
                    <FaLink className="text-success mb-2" size={24} />
                    <h6 className="mb-1">Links</h6>
                    <p className="mb-1"><span className="badge bg-success">Internos: {seoData.internalLinks}</span></p>
                    <p className="mb-1"><span className="badge bg-danger">Externos: {seoData.externalLinks}</span></p>
                    <FaExternalLinkAlt className="text-dark mb-2" size={24} />
                    <h6 className="mb-1">Backlinks</h6>
                    <p className="fs-5 fw-bold">{seoData.backlinks}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h5><FaChartLine className="me-2" style={{ color: '#28a745' }} /> Tráfico estimado</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seoData.traffic.map((t, i) => ({ mes: `M${i + 1}`, visitas: t }))}>
                    <Line type="monotone" dataKey="visitas" stroke="#0d6efd" strokeWidth={3} />
                    <CartesianGrid stroke="#ddd" strokeDasharray="5 5" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
