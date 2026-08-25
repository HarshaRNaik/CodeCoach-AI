import { useEffect, useState } from "react";

const avatars = ["👨‍💻", "🧑‍💻", "👩‍💻", "🤖", "🚀", "😎", "🦊", "🧠"];

function Profile() {
  const [name, setName] = useState(
    () => localStorage.getItem("codecoach-profile-name") ?? "Code Learner"
  );
  const [bio, setBio] = useState(
    () =>
      localStorage.getItem("codecoach-profile-bio") ??
      "Learning to code one challenge at a time."
  );
  const [avatar, setAvatar] = useState(
    () => localStorage.getItem("codecoach-profile-avatar") ?? "👨‍💻"
  );
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem("codecoach-profile-name", name);
    localStorage.setItem("codecoach-profile-bio", bio);
    localStorage.setItem("codecoach-profile-avatar", avatar);
  }, [name, bio, avatar]);

  return (
    <section className="profile-page">
      <div className="profile-page-heading">
        <div>
          <p className="eyebrow warm">Your profile</p>
          <h1>Your coding identity.</h1>
          <p className="description">
            Keep your profile simple, personal, and focused on your learning
            journey.
          </p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-main">
          <div className="profile-avatar-large">{avatar}</div>

          <div className="profile-info">
            {editing ? (
              <div className="profile-form">
                <label>
                  Display name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                  />
                </label>

                <label>
                  Bio
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Tell us about your coding journey"
                    rows={3}
                  />
                </label>
              </div>
            ) : (
              <>
                <span className="profile-role">CODECOACH LEARNER</span>
                <h2>{name}</h2>
                <p>{bio}</p>
              </>
            )}

            <button
              className="run-button profile-edit-button"
              onClick={() => setEditing((current) => !current)}
            >
              {editing ? "Save profile" : "Edit profile"}
            </button>
          </div>
        </div>

        <div className="profile-stats">
          <div>
            <strong>Learning</strong>
            <span>Keep practicing</span>
          </div>

          <div>
            <strong>Practice</strong>
            <span>Build daily momentum</span>
          </div>

          <div>
            <strong>Focus</strong>
            <span>Problem solving</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section-heading">
          <div>
            <p className="eyebrow">Personalize</p>
            <h2>Choose your avatar</h2>
          </div>
          <span className="avatar-count">{avatars.length} options</span>
        </div>

        <div className="avatar-grid">
          {avatars.map((item) => (
            <button
              key={item}
              className={`avatar-option ${
                avatar === item ? "selected" : ""
              }`}
              onClick={() => setAvatar(item)}
              aria-label={`Choose ${item} avatar`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Profile;