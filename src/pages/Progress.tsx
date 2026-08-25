type ProgressProps = {
  completed: number;
  total: number;
};

function Progress({ completed, total }: ProgressProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const stats = [
    { label: "Challenges completed", value: completed },
    { label: "Challenges available", value: total },
    { label: "Completion rate", value: `${percentage}%` },
    { label: "Current streak", value: completed > 0 ? "Keep going" : "Start today" },
  ];

  return (
    <section className="progress-page">
      <div className="progress-page-heading">
        <div>
          <p className="eyebrow warm">Your progress</p>
          <h1>See how far you've come.</h1>
          <p className="description">
            Every completed challenge is another step toward becoming a stronger programmer.
          </p>
        </div>

        <div className="progress-circle">
          <strong>{percentage}%</strong>
          <span>complete</span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>

      <div className="progress-detail">
        <div>
          <p className="eyebrow">Challenge progress</p>
          <h2>Keep building momentum</h2>
        </div>

        <div className="large-progress-track">
          <span style={{ width: `${percentage}%` }} />
        </div>

        <p>
          You've completed <strong>{completed}</strong> of{" "}
          <strong>{total}</strong> challenges.
        </p>
      </div>
    </section>
  );
}

export default Progress;