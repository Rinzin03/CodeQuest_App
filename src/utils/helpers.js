export function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateLevel(xp) {
  // Every 500 XP increases level by 1
  const level = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;
  return { level, currentLevelXp };
}