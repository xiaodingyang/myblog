import { getReadingHistory } from '@/components/reading/ReadingHistory';

const ACHIEVEMENT_KEY = 'blog_achievements';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlockedAt: string;
}

export interface ReadingStats {
  totalArticles: number;
  streakDays: number;
  lastReadDate: string;
}

const MILESTONES = [
  { id: 'first_read', title: '初来乍到', desc: '阅读了第一篇文章', icon: '📖', check: (total: number) => total >= 1 },
  { id: 'read_5', title: '书虫初现', desc: '累计阅读 5 篇文章', icon: '📚', check: (total: number) => total >= 5 },
  { id: 'read_10', title: '知识探索者', desc: '累计阅读 10 篇文章', icon: '🔍', check: (total: number) => total >= 10 },
  { id: 'read_20', title: '博览群书', desc: '累计阅读 20 篇文章', icon: '🎓', check: (total: number) => total >= 20 },
  { id: 'streak_3', title: '三日之约', desc: '连续 3 天访问博客', icon: '🔥', check: (_: number, streak: number) => streak >= 3 },
  { id: 'streak_7', title: '一周常客', desc: '连续 7 天访问博客', icon: '⭐', check: (_: number, streak: number) => streak >= 7 },
];

function calculateStreak(): number {
  const history = getReadingHistory();
  if (!history.length) return 0;
  const dates = [...new Set(history.map(h => h.readAt.split('T')[0]))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  if (dates[0] !== today) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

export function getUnlockedAchievements(): Achievement[] {
  try {
    return JSON.parse(localStorage.getItem(ACHIEVEMENT_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getAllMilestones() {
  return MILESTONES;
}

export function checkAchievements(): Achievement | null {
  const history = getReadingHistory();
  const total = history.length;
  const streak = calculateStreak();

  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(a => a.id));

  for (const m of MILESTONES) {
    if (!unlockedIds.has(m.id) && m.check(total, streak)) {
      const achievement: Achievement = {
        id: m.id,
        title: m.title,
        desc: m.desc,
        unlockedAt: new Date().toISOString(),
      };
      unlocked.push(achievement);
      localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(unlocked));
      return achievement;
    }
  }
  return null;
}

export function getReadingStats(): ReadingStats {
  const history = getReadingHistory();
  return {
    totalArticles: history.length,
    streakDays: calculateStreak(),
    lastReadDate: history[0]?.readAt || '',
  };
}
