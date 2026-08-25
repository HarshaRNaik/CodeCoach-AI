import { useEffect, useState } from "react";

type SettingsProps = {
  language: string;
  onLanguageChange: (language: string) => void;
};

function Settings({ language, onLanguageChange }: SettingsProps) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("codecoach-theme") ?? "light"
  );

  const [sound, setSound] = useState(
    () => localStorage.getItem("codecoach-sound") !== "off"
  );

  useEffect(() => {
    localStorage.setItem("codecoach-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("codecoach-sound", sound ? "on" : "off");
  }, [sound]);

  return (
    <section className="settings-page">
      <div>
        <p className="eyebrow warm">Preferences</p>
        <h1>Make CodeCoach yours.</h1>
        <p className="description">
          Customize the way you learn, practice, and interact with your coding coach.
        </p>
      </div>

      <div className="settings-list">
        <div className="setting-card">
          <div>
            <p className="eyebrow">Appearance</p>
            <h2>Theme</h2>
            <p>Choose how CodeCoach looks on your device.</p>
          </div>

          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="setting-card">
          <div>
            <p className="eyebrow">Practice</p>
            <h2>Preferred language</h2>
            <p>This language is used when starting coding challenges.</p>
          </div>

          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            <option>JavaScript</option>
            <option>TypeScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C++</option>
            <option>Go</option>
          </select>
        </div>

        <div className="setting-card">
          <div>
            <p className="eyebrow">Experience</p>
            <h2>Sound effects</h2>
            <p>Enable or disable interface sounds.</p>
          </div>

          <button
            className={`toggle ${sound ? "on" : ""}`}
            onClick={() => setSound((current) => !current)}
            aria-pressed={sound}
          >
            <span />
            {sound ? "On" : "Off"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;