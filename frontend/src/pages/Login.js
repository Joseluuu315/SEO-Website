import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      login(data.token, data.user);
      navigate('/');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-3xl animate-floaty" />
        <div className="absolute top-24 -right-32 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-3xl animate-floaty" style={{ animationDelay: '1.2s' }} />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-[34rem] w-[34rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.1s' }} />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-14">
        <div className="grid w-full grid-cols-1 items-stretch gap-10 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-center">
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-glow" />
              <div className="text-xl font-semibold tracking-tight">SEO Pro</div>
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Analiza, mejora y
              <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent"> domina tu SEO</span>
            </h1>
            <p className="mt-4 max-w-lg text-white/70">
              Accede a tu panel, analiza URLs en segundos y guarda tu historial por usuario en Mongo.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glow">
                <div className="text-sm text-white/60">Score instantáneo</div>
                <div className="mt-1 text-lg font-semibold">SEO Score + Issues</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glow">
                <div className="text-sm text-white/60">Historial</div>
                <div className="mt-1 text-lg font-semibold">Guardado por usuario</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold">Inicia sesión</h2>
                  <p className="mt-1 text-sm text-white/70">Accede a tu panel y sigue optimizando</p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">⚠</span>
                    <div>{error}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm text-white/70">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-white/70">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-4 py-3 font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-white/70">
                ¿No tienes cuenta?{' '}
                <Link className="font-semibold text-cyan-300 hover:text-cyan-200" to="/register">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
