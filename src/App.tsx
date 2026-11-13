import { useState, useEffect } from 'preact/hooks';
import { useNav, type Screen } from './lib/store';
import { readPref, writePref, applyTheme, watchSystemTheme, type ThemePref } from './lib/theme';
import HomeView from './views/HomeView';
import TrackView from './views/TrackView';
import KisiMateriView from './views/KisiMateriView';
import WorkbenchView from './views/WorkbenchView';
import ReviewView from './views/ReviewView';
import SettingsView from './views/SettingsView';
import Header from './components/Header';
import './components/app.css';

export default function App() {
  const nav = useNav();
  const [theme, setTheme] = useState<ThemePref>(readPref);

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
      case 'cpns':
        return <TrackView family="cpns" go={nav.go} />;
      case 'bumn':
        return <TrackView family="bumn" go={nav.go} />;
      case 'track':
        return <TrackView family={s.family} go={nav.go} />;
      case 'materi':
        return (
          <KisiMateriView
            initialFamily={s.family}
            initialSubmateriId={s.submateriId}
            go={nav.go}
          />
        );
      case 'workbench':
        return (
          <WorkbenchView
            packId={s.packId}
            mode={s.mode}
            subtest={s.subtest}
            questionIds={s.questionIds}
            limit={s.limit}
            go={nav.go}
            theme={theme}
            onTheme={changeTheme}
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

  const isWorkbench = nav.screen.name === 'workbench';
  const activeTrack =
    nav.screen.name === 'track'
      ? nav.screen.family
      : nav.screen.name === 'cpns' || nav.screen.name === 'bumn'
        ? nav.screen.name
        : null;
  const routeMood =
    activeTrack === 'cpns'
      ? 'mood-cpns'
      : activeTrack === 'bumn'
        ? 'mood-bumn'
        : 'mood-dual';

  if (isWorkbench) {
    return (
      <div className={`app-shell ${routeMood} is-exam-canvas`}>
        <main className="app-main-exam">{renderScreen(nav.screen)}</main>
      </div>
    );
  }

  return (
    <div className={`app-shell ${routeMood} neu-outer-stage`}>
      <div className="studio-window">
        <Header
          screen={nav.screen}
          theme={theme}
          onTheme={changeTheme}
          go={nav.go}
        />
        <main className="studio-canvas">{renderScreen(nav.screen)}</main>
      </div>
    </div>
  );
}
