import { useState, useEffect } from 'preact/hooks';
import { useNav, type Screen } from './lib/store';
import { readPref, writePref, applyTheme, watchSystemTheme, type ThemePref } from './lib/theme';
import HomeView from './views/HomeView';
import WorkbenchView from './views/WorkbenchView';
import ReviewView from './views/ReviewView';
import SettingsView from './views/SettingsView';
import Header from './components/Header';

export default function App() {
  const nav = useNav();
  const [theme, setTheme] = useState<ThemePref>(readPref);

  // Terapkan tema saat init dan saat pref berubah; ikuti perubahan sistem bila 'system'.
  useEffect(() => {
    applyTheme(theme);
    const off = watchSystemTheme(() => applyTheme(readPref()));
    return off;
  }, [theme]);

  const changeTheme = (t: ThemePref) => {
    setTheme(t);
    writePref(t);
    applyTheme(t);
  };

  const renderScreen = (s: Screen) => {
    switch (s.name) {
      case 'home':
        return <HomeView go={nav.go} />;
      case 'workbench':
        return (
          <WorkbenchView
            packId={s.packId}
            mode={s.mode}
            subtest={s.subtest}
            go={nav.go}
          />
        );
      case 'review':
        return <ReviewView attemptId={s.attemptId} go={nav.go} />;
      case 'settings':
        return <SettingsView go={nav.go} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Header screen={nav.screen} theme={theme} onTheme={changeTheme} go={nav.go} />
      <main className="app-main">{renderScreen(nav.screen)}</main>
    </div>
  );
}
