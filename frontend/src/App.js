import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [url, setUrl] = useState('');
  const [seoData, setSeoData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    setSeoData(data);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary">Analizador SEO</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Introduce una URL</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="https://ejemplo.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Analizar</button>
      </form>

      {seoData && (
        <div>
          <h3>Resultados para: {seoData.url}</h3>
          <p><strong>Título:</strong> {seoData.title}</p>
          <p><strong>Palabras clave:</strong> {seoData.keywords.join(', ')}</p>
          <p><strong>Backlinks:</strong> {seoData.backlinks}</p>

          <h5>Tráfico (ejemplo):</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={seoData.traffic.map((t, i) => ({ mes: `M${i+1}`, visitas: t }))}>
              <Line type="monotone" dataKey="visitas" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;
