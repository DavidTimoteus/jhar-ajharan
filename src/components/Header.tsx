import type { Screen } from '../lib/store';
import type { ThemePref } from '../lib/theme';

const THEME_LABEL: Record<ThemePref, string> = {
  system: 'Ikut sistem',
  light: 'Terang',
  dark: 'Gelap',
};

interface Props {
  screen: Screen;
  theme: ThemePref;
  onTheme: (t: ThemePref) => void;
  go: (s: Screen) => void;
}

export default function Header({ screen, theme, onTheme, go }: Props) {
  const isHome = screen.name === 'home';
  const isSettings = screen.name === 'settings';

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          className="brand"
          onClick={() => go({ name: 'home' })}
          aria-label="Kembali ke beranda"
        >
          <span className="brand-name">Jhâr-Ajhârân</span>
        </button>

        <nav className="app-nav" aria-label="Navigasi utama">
          <button
            className={isHome ? 'active' : ''}
            onClick={() => go({ name: 'home' })}
          >
            Beranda
          </button>
          <button
            className={isSettings ? 'active' : ''}
            onClick={() => go({ name: 'settings' })}
          >
            Pengaturan
          </button>
        </nav>

        <div className="theme-switch">
          <select
            value={theme}
            onChange={(e) => onTheme((e.target as HTMLSelectElement).value as ThemePref)}
            aria-label="Mode tampilan"
          >
            <option value="system">Sistem</option>
            <option value="light">Terang</option>
            <option value="dark">Gelap</option>
          </select>
        </div>
      </div>
    </header>
  );
}
