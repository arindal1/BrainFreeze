/**
 * Client-side research streak: counts consecutive calendar days (local time)
 * with at least one submitted job, ending today or yesterday. Purely a nudge -
 * no penalty copy, and the caller should hide it below a minimum streak length.
 */
export function computeStreak(jobs: { createdAt: string }[]): number {
  const days = new Set(jobs.map((j) => dateKey(new Date(j.createdAt))));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!days.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}