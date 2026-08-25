import type { ProgrammingLanguage } from "../lib/api";
import type { Theme } from "../App";

type SettingsProps = {
  language: ProgrammingLanguage;
  onLanguageChange: (value: ProgrammingLanguage) => void;
  theme: Theme;
  onThemeChange: (value: Theme) => void;
};

function Settings({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
}: SettingsProps) {
  return (
    <section className="settings-page">
      <div className="settings-header">
        <p className="eyebrow">Workspace settings</p>
        <h1>Settings</h1>
        <p>
          Customize your CodeCoach workspace and
          choose how you want to practice.
        </p>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>Editor preferences</h2>
            <p>
              Choose the language used by the editor,
              tutor, and challenge checks.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <strong>Preferred language</strong>
            <span>
              Used for the code editor and evaluator.
            </span>
          </div>

          <select
            value={language}
            onChange={(event) =>
              onLanguageChange(
                event.target.value as ProgrammingLanguage
              )
            }
          >
            <option>JavaScript</option>
            <option>TypeScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C++</option>
            <option>Go</option>
          </select>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>Appearance</h2>
            <p>
              Choose the visual theme for your
              CodeCoach workspace.
            </p>
          </div>
        </div>

        <div className="theme-options">
          <button
            type="button"
            className={`theme-option ${
              theme === "light" ? "selected" : ""
            }`}
            onClick={() => onThemeChange("light")}
          >
            <span className="theme-preview light-preview">
              ☀️
            </span>

            <span>
              <strong>Light</strong>
              <small>Clean and bright</small>
            </span>

            {theme === "light" && (
              <span className="theme-check">✓</span>
            )}
          </button>

          <button
            type="button"
            className={`theme-option ${
              theme === "dark" ? "selected" : ""
            }`}
            onClick={() => onThemeChange("dark")}
          >
            <span className="theme-preview dark-preview">
              🌙
            </span>

            <span>
              <strong>Dark</strong>
              <small>Easy on the eyes</small>
            </span>

            {theme === "dark" && (
              <span className="theme-check">✓</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;