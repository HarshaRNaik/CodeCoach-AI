type ProgressProps = {
  completed: number;
  total: number;
};

function Progress({ completed, total }: ProgressProps) {
  const percentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const remaining = Math.max(total - completed, 0);

  return (
    <section className="progress-page">
      <div className="progress-page-heading">
        <div>
          <p className="eyebrow warm">Your progress</p>
          <h1>Keep the momentum going.</h1>
          <p className="description">
            Track your coding practice and see how each challenge moves you
            forward.
          </p>
        </div>
      </div>

      <div className="progress-overview">
        <div className="progress-ring-card">
          <div
            className="progress-ring"
            style={{
              background: `conic-gradient(var(--green) ${
                percentage * 3.6
              }deg, #e5ebe2 ${percentage * 3.6}deg)`,
            }}
          >
            <div className="progress-ring-inner">
              <strong>{percentage}%</strong>
              <span>complete</span>
            </div>
          </div>

          <div>
            <p className="eyebrow">Overall completion</p>
            <h2>{completed} challenges solved</h2>
            <p>
              {remaining === 0
                ? "You've completed every available challenge."
                : `${remaining} challenge${
                    remaining === 1 ? "" : "s"
                  } left to complete.`}
            </p>
          </div>
        </div>

        <div className="progress-stats">
          <article className="stat-card featured">
            <span>Completed</span>
            <strong>{completed}</strong>
            <small>challenges solved</small>
          </article>

          <article className="stat-card">
            <span>Remaining</span>
            <strong>{remaining}</strong>
            <small>challenges to go</small>
          </article>

          <article className="stat-card">
            <span>Available</span>
            <strong>{total}</strong>
            <small>total challenges</small>
          </article>

          <article className="stat-card">
            <span>Streak</span>
            <strong>{completed > 0 ? "🔥" : "—"}</strong>
            <small>{completed > 0 ? "keep it going" : "start today"}</small>
          </article>
        </div>
      </div>

      <div className="progress-detail">
        <div className="progress-detail-heading">
          <div>
            <p className="eyebrow">Challenge progress</p>
            <h2>You're making progress.</h2>
          </div>

          <strong>
            {completed}/{total}
          </strong>
        </div>

        <div className="large-progress-track">
          <span style={{ width: `${percentage}%` }} />
        </div>

        <div className="progress-track-labels">
          <span>Started</span>
          <strong>{percentage}% complete</strong>
          <span>Goal</span>
        </div>
      </div>
    </section>
  );
}

export default Progress;