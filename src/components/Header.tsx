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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19L12 5l8 14H4z" />
              <path d="M9 14.5h6" />
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
