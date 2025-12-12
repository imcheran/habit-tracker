import { Habit, TrackingData, HabitStats, DetailedMonthlyStats, HabitYearlyStats } from '../types';
import { MONTH_NAMES } from '../constants';

const getDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to safely parse YYYY-MM-DD to a Date object at Noon (avoiding DST/midnight issues)
const parseDateSafe = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0); 
};

// Matches Excel Version 7.0 Grading Scale
export const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C';
  return 'F';
};

export const getStatus = (percentage: number): 'On Track' | 'At Risk' | 'Off Track' => {
  if (percentage >= 70) return 'On Track';
  if (percentage >= 50) return 'At Risk';
  return 'Off Track';
};

export const calculateHabitStats = (habit: Habit, data: TrackingData, year: number = new Date().getFullYear()): HabitStats => {
  const startOfYear = new Date(year, 0, 1);
  const today = new Date();
  
  // 1. Consistency (Year-Specific)
  // We filter data for the specific year to calculate yearly consistency
  const yearCompletedDates = Object.keys(data).filter(d => {
    return data[d].includes(habit.id) && parseInt(d.split('-')[0]) === year;
  });

  let daysPassed = 0;
  if (year < today.getFullYear()) {
    daysPassed = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
  } else {
    daysPassed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24)) + 1;
  }

  const consistency = daysPassed > 0 ? Math.round((yearCompletedDates.length / daysPassed) * 100) : 0;

  // 2. Best Streak (Global)
  // We look at ALL data to find the absolute best streak
  const allCompletedDatesSorted = Object.keys(data)
    .filter(d => data[d].includes(habit.id))
    .sort(); // Sorts YYYY-MM-DD correctly

  let bestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of allCompletedDatesSorted) {
    const dateObj = parseDateSafe(dateStr);

    if (!lastDate) {
      tempStreak = 1;
    } else {
      // Diff in days
      const diff = Math.round((dateObj.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
    lastDate = dateObj;
  }

  // 3. Current Streak (Global, anchored to Today)
  let currentStreak = 0;
  
  // Start checking from Today (set to Noon to match parseDateSafe)
  let checkDate = new Date();
  checkDate.setHours(12, 0, 0, 0);

  // If we are strictly viewing a past year's stats contextually, we might want to anchor to Dec 31st.
  // However, usually "Current Streak" implies "Active right now". 
  // If you strictly want historical stats for previous years, uncomment the block below.
  // if (year !== today.getFullYear()) {
  //    checkDate = new Date(year, 11, 31, 12, 0, 0, 0);
  // }

  let streakAlive = true;
  while (streakAlive) {
      const dateStr = getDateString(checkDate);

      if (data[dateStr]?.includes(habit.id)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
      } else {
          // Grace Period Logic:
          // If the date we are checking is Today, and we haven't done it yet,
          // the streak is not broken; we simply check yesterday.
          const checkDateStr = getDateString(checkDate);
          const todayStr = getDateString(new Date());
          
          if (checkDateStr === todayStr) {
              checkDate.setDate(checkDate.getDate() - 1);
          } else {
              streakAlive = false;
          }
      }
  }

  return {
    consistency,
    currentStreak,
    bestStreak,
    totalCompletions: yearCompletedDates.length,
    status: getStatus(consistency),
    grade: getGrade(consistency)
  };
};

export const getDetailedMonthlyStats = (habits: Habit[], data: TrackingData, year: number): DetailedMonthlyStats[] => {
  return MONTH_NAMES.map((monthName, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalPossible = daysInMonth * habits.length;
    let totalHabitsDone = 0;
    
    let dailyScores: number[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayCompletions = data[dateStr]?.length || 0;
        totalHabitsDone += dayCompletions;
        dailyScores.push(habits.length > 0 ? (dayCompletions / habits.length) * 100 : 0);
    }
    
    // Avg Consistency (Avg of daily scores)
    const avgConsistency = dailyScores.length > 0 
        ? Math.round(dailyScores.reduce((a, b) => a + b, 0) / dailyScores.length) 
        : 0;

    const bestDayScore = dailyScores.length > 0 ? Math.round(Math.max(...dailyScores)) : 0;
    const worstDayScore = dailyScores.length > 0 ? Math.round(Math.min(...dailyScores)) : 0;

    let habitsOnTrack = 0;
    let habitsAtRisk = 0;

    habits.forEach(habit => {
        let habitMonthCount = 0;
        for (let day = 1; day <= daysInMonth; day++) {
             const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
             if (data[dateStr]?.includes(habit.id)) habitMonthCount++;
        }
        const habitMonthPct = daysInMonth > 0 ? (habitMonthCount / daysInMonth) * 100 : 0;
        if (habitMonthPct >= 70) habitsOnTrack++;
        else habitsAtRisk++;
    });

    return {
      month: monthName,
      avgConsistency,
      bestDayScore,
      worstDayScore,
      totalHabitsDone,
      totalPossible,
      grade: getGrade(avgConsistency),
      status: avgConsistency >= 80 ? 'Excellent' : avgConsistency >= 70 ? 'Good' : avgConsistency >= 60 ? 'Average' : 'Needs Work',
      habitsOnTrack,
      habitsAtRisk
    };
  });
};

export const getHabitYearlyStats = (habit: Habit, data: TrackingData, year: number): HabitYearlyStats => {
    const basicStats = calculateHabitStats(habit, data, year);
    
    let bestMonthName = '-';
    let maxMonthPct = -1;
    let totalDaysActive = 0; 

    MONTH_NAMES.forEach((mName, mIdx) => {
        const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
        let monthCount = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (data[dateStr]?.includes(habit.id)) monthCount++;
        }
        
        const pct = daysInMonth > 0 ? (monthCount / daysInMonth) * 100 : 0;
        if (pct > maxMonthPct) {
            maxMonthPct = pct;
            bestMonthName = mName;
        }
        totalDaysActive += monthCount;
    });

    let rec = "Keep it up!";
    if (basicStats.grade === 'F') rec = "Start smaller, aim for 3 days/week.";
    else if (basicStats.grade === 'C' || basicStats.grade === 'D') rec = "Try to stack this habit with another.";
    else if (basicStats.grade === 'B') rec = "Good, push for a longer streak.";
    else if (basicStats.grade.startsWith('A')) rec = "Excellent! Mentor others.";

    return {
        ...basicStats,
        bestMonth: bestMonthName,
        totalCompletions: totalDaysActive,
        recommendation: rec,
        yearlyAvg: basicStats.consistency
    };
};