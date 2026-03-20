import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Settings from '../pages/Settings';
import Admin from '../pages/Admin';

const Layout = ({ children }) => {
  const { user, logout, token } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    defaultAiModel: 'gpt-4o-mini',
    exportFormat: 'pdf',
    notifications: true,
    autoSave: true,
    language: 'es'
  });
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperAdmin = user?.email === 'joselufupa2016@gmail.com';

  useEffect(() => {
    // Load preferences globally
    const loadPreferences = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const loadedPrefs = data.preferences || preferences;
          setPreferences(loadedPrefs);
          
          // Apply theme globally
          applyTheme(loadedPrefs.theme);
        }
      } catch (err) {
        console.log('Using default preferences');
        applyTheme('dark');
      }
    };
    
    if (token) {
      loadPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    } else if (theme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.body.classList.remove('light');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      }
    }
  };

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

  const getThemeClasses = () => {
    if (preferences.theme === 'light') {
      return {
        bg: 'bg-[#f8fafc]',
        header: 'bg-white/90 border-gray-200',
        text: 'text-gray-900',
        subtext: 'text-gray-600',
        nav: 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100',
        dropdown: 'bg-white border-gray-200 shadow-lg',
        footer: 'bg-white/90 border-gray-200'
      };
    }
    return {
      bg: 'bg-[#070711]',
      header: 'bg-black/40 border-white/10',
      text: 'text-white',
      subtext: 'text-white/60',
      nav: 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
      dropdown: 'bg-black/90 border-white/10',
      footer: 'bg-black/40 border-white/10'
    };
  };

  const theme = getThemeClasses();

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme.bg}`}>
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-cyan-500/14' : 'bg-cyan-400/8'
        }`} />
        <div className={`absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-fuchsia-500/12' : 'bg-fuchsia-400/6'
        }`} style={{ animationDelay: '1.4s' }} />
        <div className={`absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-400/5'
        }`} style={{ animationDelay: '2.6s' }} />
      </div>

      {/* Header */}
      <header className={`relative z-50 border-b backdrop-blur-xl ${theme.header}`}>
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-emerald-400 shadow-glow" />
              <div>
                <div className={`text-xs font-semibold tracking-[0.2em] ${theme.subtext}`}>AVERONIX SEO TOOLS</div>
                <div className={`text-lg font-semibold ${theme.text}`}>Professional Suite</div>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <a
                href="/"
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${theme.nav}`}
              >
                Panel
              </a>
              <a
                href="/compare"
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${theme.nav}`}
              >
                Comparar
              </a>
              <a
                href="/sites"
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${theme.nav}`}
              >
                Sitios
              </a>
              <a
                href="/reports"
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${theme.nav}`}
              >
                Informes
              </a>
              {/* Dropdown para Perfil y Ajustes */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold transition ${theme.nav}`}
                >
                  <div className={`h-7 w-7 rounded-xl grid place-items-center font-semibold ${
                    preferences.theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {user?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className={`text-xs ${theme.subtext}`}>
                    {user?.username || user?.email || 'Usuario'}
                  </div>
                  <svg className={`w-4 h-4 ${theme.subtext}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {profileDropdownOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-48 rounded-2xl p-2 ${theme.dropdown}`}>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setProfileDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm rounded-xl transition ${
                        preferences.theme === 'dark' 
                          ? 'text-white/80 hover:bg-white/10' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setProfileDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm rounded-xl transition ${
                        preferences.theme === 'dark' 
                          ? 'text-white/80 hover:bg-white/10' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Ajustes
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setProfileDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm rounded-xl transition border-t ${
                          preferences.theme === 'dark' 
                            ? 'text-violet-400 hover:bg-white/10 border-white/10' 
                            : 'text-violet-600 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        🛡️ Administración
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm rounded-xl transition border-t ${
                        preferences.theme === 'dark' 
                          ? 'text-rose-400 hover:bg-rose-500/10 border-white/10' 
                          : 'text-rose-600 hover:bg-rose-50 border-gray-200'
                      }`}
                    >
                      Cerrar sesión
                    </button>
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
      <footer className={`relative z-50 border-t backdrop-blur-xl ${theme.footer}`}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className={`flex flex-col gap-2 text-center text-xs md:flex-row md:justify-between md:text-left ${
            preferences.theme === 'dark' ? 'text-white/50' : 'text-gray-600'
          }`}>
            <div>
              &copy; 2026 Averonix SEO Tools. Built with &hearts; by{' '}<a
                href="https://github.com/Joseluuu315/SEO-Website"
                target="_blank"
                rel="noopener noreferrer"
                className={`underline transition ${
                  preferences.theme === 'dark' ? 'hover:text-white/70' : 'hover:text-gray-900'
                }`}
              >
                GitHub Repository
              </a>
              <a
                href="https://averonix.studio"
                target="_blank"
                rel="noopener noreferrer"
                className={`transition ${
                  preferences.theme === 'dark' ? 'hover:text-white/70' : 'hover:text-gray-900'
                }`}
              >
                Averonix Studio
              </a>
            </div>
            <div className="flex gap-4 justify-center md:justify-end">
              <a href="https://averonix.studio" target="_blank" rel="noopener noreferrer" className={`transition ${
                preferences.theme === 'dark' ? 'hover:text-white/70' : 'hover:text-gray-900'
              }`}>Averonix Studio</a>
              <span className={`mx-2 ${
                preferences.theme === 'dark' ? 'text-white/50' : 'text-gray-400'
              }`}>•</span>
              <a href="/help" className={`transition ${
                preferences.theme === 'dark' ? 'hover:text-white/70' : 'hover:text-gray-900'
              }`}>Ayuda</a>
              <span className={`mx-2 ${
                preferences.theme === 'dark' ? 'text-white/50' : 'text-gray-400'
              }`}>•</span>
              <a href="/privacy" className={`transition ${
                preferences.theme === 'dark' ? 'hover:text-white/70' : 'hover:text-gray-900'
              }`}>Privacidad</a>
              <span className={`mx-2 ${
                preferences.theme === 'dark' ? 'text-white/50' : 'text-gray-400'
              }`}>•</span>
              <a href="/terms" className={`transition ${
                preferences.theme === 'dark' ? 'hover:text-white/70' : 'hover:text-gray-900'
              }`}>Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
