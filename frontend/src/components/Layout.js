import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Settings from '../pages/Settings';
import Admin from '../pages/Admin';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperAdmin = user?.email === 'joselufupa2016@gmail.com';

  useEffect(() => {
    if (location.pathname === '/settings') {
      setShowSettings(true);
      setShowAdmin(false);
    } else if (location.pathname === '/admin') {
      setShowAdmin(true);
      setShowSettings(false);
    } else {
      setShowSettings(false);
      setShowAdmin(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/14 blur-3xl animate-floaty" />
        <div className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/12 blur-3xl animate-floaty" style={{ animationDelay: '1.4s' }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.6s' }} />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-emerald-400 shadow-glow" />
              <div>
                <div className="text-xs font-semibold tracking-[0.2em] text-white/60">AVERONIX SEO TOOLS</div>
                <div className="text-lg font-semibold">Professional Suite</div>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <a
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                Panel
              </a>
              <a
                href="/compare"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                Comparar
              </a>
              <a
                href="/sites"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                Sitios
              </a>
              <a
                href="/reports"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                Informes
              </a>
              {/* Dropdown para Perfil y Ajustes */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  <div className="h-7 w-7 rounded-xl bg-white/10 text-white/80 grid place-items-center font-semibold">
                    {user?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="text-xs text-white/60">
                    {user?.username || user?.email || 'Usuario'}
                  </div>
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                  </svg>
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                      >
                        Perfil
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                      >
                        Ajustes
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            navigate('/admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-violet-400 hover:bg-white/10 transition border-t border-white/10 mt-1"
                        >
                          🛡️ Administración
                        </button>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition border-t border-white/10 mt-1"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative">
        {showSettings && <Settings />}
        {showAdmin && <Admin />}
        {!showSettings && !showAdmin && children}
      </main>

      {/* Footer */}
      <footer className="relative z-50 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-2 text-center text-xs text-white/50 md:flex-row md:justify-between md:text-left">
            <div>
              &copy; 2026 Averonix SEO Tools. Built with &hearts; by{' '}<a
                href="https://github.com/Joseluuu315/SEO-Website"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/70 transition"
              >
                GitHub Repository
              </a>
              <a
                href="https://averonix.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/70 transition"
              >
                Averonix Studio
              </a>
            </div>
            <div className="flex gap-4 justify-center md:justify-end">
              <a href="https://averonix.studio" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition">Averonix Studio</a>
              <span className="text-white/50 mx-2">•</span>
              <a href="/help" className="hover:text-white/70 transition">Ayuda</a>
              <span className="text-white/50 mx-2">•</span>
              <a href="/privacy" className="hover:text-white/70 transition">Privacidad</a>
              <span className="text-white/50 mx-2">•</span>
              <a href="/terms" className="hover:text-white/70 transition">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
