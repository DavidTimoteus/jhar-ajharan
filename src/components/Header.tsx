import { useEffect, useState } from 'preact/hooks';
import type { Screen } from '../lib/store';
import type { ThemePref } from '../lib/theme';
import { createSession, switchSession, useSessionState } from '../lib/session';

interface Props {
  screen: Screen;
  theme: ThemePref;
  onTheme: (t: ThemePref) => void;
  go: (s: Screen) => void;
}

type NavKey = 'home' | 'cpns' | 'bumn' | 'materi' | 'settings';

const NAV_ITEMS: { key: NavKey; label: string; icon: string; badge?: string }[] = [
  { key: 'home', label: 'Beranda', icon: '⌂' },
  { key: 'cpns', label: 'Tes CPNS', icon: '✦', badge: 'cpns' },
  { key: 'bumn', label: 'Tes BUMN', icon: '◈', badge: 'bumn' },
  { key: 'materi', label: 'Kisi & Materi', icon: '◫' },
  { key: 'settings', label: 'Bank Soal & Data', icon: '⚙' },
];

export default function Header({ screen, theme, onTheme, go }: Props) {
  const { sessions, active } = useSessionState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const activeKey: NavKey | null =
    screen.name === 'track'
      ? screen.family === 'cpns'
        ? 'cpns'
        : screen.family === 'bumn'
          ? 'bumn'
          : null
      : screen.name === 'home' ||
          screen.name === 'cpns' ||
          screen.name === 'bumn' ||
          screen.name === 'materi' ||
          screen.name === 'settings'
        ? screen.name
        : null;

  const navigate = (key: NavKey) => {
    setMobileOpen(false);
    if (key === 'cpns' || key === 'bumn') {
      go({ name: 'track', family: key });
    } else {
      go({ name: key });
    }
  };

  const nextTheme = (): ThemePref => {
    if (theme === 'system') return 'light';
    if (theme === 'light') return 'dark';
    return 'system';
  };

  const themeLabel =
    theme === 'system' ? 'Tema Otomatis' : theme === 'light' ? 'Mode Terang' : 'Mode Gelap';

  return (
    <aside className="sidebar-rail" aria-label="Navigasi utama">
      <div className="rail-top">
        <button
          type="button"
          className="brand"
          onClick={() => navigate('home')}
          aria-label="Kembali ke beranda Jhâr-Ajhârân"
        >
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="ja-ui-bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2b3f57" />
                  <stop offset="100%" stopColor="#172331" />
                </linearGradient>
                <linearGradient id="ja-ui-accent" x1="28" y1="18" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38e0b0" />
                  <stop offset="100%" stopColor="#149674" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#ja-ui-bg)" />
              <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="15.25" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
              <path
                d="M27 20V38.5C27 43.2 23.4 46.5 18.8 46.5C15.8 46.5 13.7 45.1 12.6 42.8"
                stroke="#c7ddf3"
                strokeWidth="4.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M31.5 46L39.5 20.5L49 46"
                stroke="url(#ja-ui-accent)"
                strokeWidth="4.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M34.8 38.5H45.8"
                stroke="url(#ja-ui-accent)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M32 10.5L33.7 14.5L37.7 16.2L33.7 17.9L32 21.9L30.3 17.9L26.3 16.2L30.3 14.5Z"
                fill="#f59e0b"
              />
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-name">Jhâr-Ajhârân</span>
            <span className="brand-sub">Learning Studio</span>
          </span>
        </button>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu navigasi"
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
        </button>
      </div>

      <nav className={`rail-nav ${mobileOpen ? 'is-open' : ''}`}>
        {NAV_ITEMS.map((item) => {
          const active = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`rail-btn ${active ? 'is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(item.key)}
            >
              <span className="rail-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="rail-label">{item.label}</span>
              {item.badge && (
                <span className={`nav-dot nav-dot-${item.badge}`} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>

      <div className={`rail-bottom ${mobileOpen ? 'is-open' : ''}`}>
        <div className="rail-profile-wrap">
          <button
            type="button"
            className="rail-profile-btn"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            title="Ganti sesi peserta (riwayat & progres terpisah per profil)"
          >
            <span className="rail-avatar" aria-hidden="true">
              {active.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="rail-profile-copy">
              <strong>{active.name}</strong>
              <small>Sesi aktif ({sessions.length})</small>
            </span>
            <span className="rail-caret" aria-hidden="true">
              {profileOpen ? '▴' : '▾'}
            </span>
          </button>

          {profileOpen && (
            <div className="rail-profile-menu" role="menu">
              <div className="rail-profile-list">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="menuitem"
                    className={`rail-session-item ${s.id === active.id ? 'is-current' : ''}`}
                    onClick={() => {
                      switchSession(s.id);
                      setProfileOpen(false);
                    }}
                  >
                    <span>{s.name}</span>
                    {s.id === active.id && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
              <form
                className="rail-session-add"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newName.trim()) return;
                  createSession(newName);
                  setNewName('');
                  setProfileOpen(false);
                }}
              >
                <input
                  type="text"
                  value={newName}
                  placeholder="Nama peserta baru…"
                  maxLength={32}
                  onInput={(e) => setNewName((e.target as HTMLInputElement).value)}
                />
                <button type="submit" className="rail-add-btn" title="Buat sesi baru">
                  +
                </button>
              </form>
            </div>
          )}
        </div>

        <button
          type="button"
          className="rail-utility-btn"
          onClick={() => onTheme(nextTheme())}
        >
          <span aria-hidden="true">
            {theme === 'light' ? '☀' : theme === 'dark' ? '◐' : '◑'}
          </span>
          <span>{themeLabel}</span>
        </button>

        <div className="rail-status">
          <span className={`status-beacon ${online ? 'is-online' : 'is-offline'}`} />
          <span>{online ? 'Cache Browser Aktif' : 'Offline Aktif'}</span>
        </div>
      </div>
    </aside>
  );
}
