import { GoogleGenAI } from "@google/genai";
import { Habit, HabitStats, DailyEntry } from '../types';

declare var process: any;

// Helper to check for API Key presence
const getApiKey = (): string | null => {
  // In Vite, defined variables are replaced literally. 
  // If the variable wasn't set at build time, it might be undefined.
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
  }
  return null;
};

// Helper to format data for the AI
const formatDataForAI = (habits: Habit[], stats: Record<string, HabitStats>) => {
  const today = new Date().toISOString().split('T')[0];
  const summary = habits.map(h => {
    const s = stats[h.id];
    return {
      habit: h.name,
      category: h.category,
      consistency: s.consistency + '%',
      streak: s.currentStreak,
      status: s.status
    };
  });
  
  return JSON.stringify({
    date: today,
    habits: summary
  });
};

export const generateProductivityInsights = async (
  habits: Habit[],
  stats: Record<string, HabitStats>
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("MISSING API KEY: Please add 'API_KEY' to your Vercel Environment Variables and redeploy.");
        return "Configuration Error: API Key is missing in deployment settings.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const jsonData = formatDataForAI(habits, stats);
    
    const prompt = `
      You are the "OmniLife Super-Brain," a bio-digital system analyzing a user's habits.
      Here is the performance data:
      ${jsonData}

      If the user is in "Hero Mode", speak like a Tactical AI Commander.
      If the user is in "Zen Mode", speak like a Stoic Philosopher.

      Structure:
      1. **System Status**: Brief performance summary.
      2. **Critical Weakness**: Identify one 'At Risk' habit.
      3. **Strategic Protocol**: One specific action to fix it.
      4. **Inspirational Directive**: Short quote or command.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Service is currently unavailable. Please check your connection or API Key configuration.";
  }
};

export const generateOrbitAnalysis = async (
  entry: DailyEntry
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("MISSING API KEY: Please add 'API_KEY' to your Vercel Environment Variables and redeploy.");
        return "Configuration Error: API Key is missing in deployment settings.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are the "OmniLife Super-Brain." Your goal is to find hidden correlations between biology and behavior.
      
      User Daily Entry for ${entry.date}:
      
      **Bio-Markers:**
      - Sleep: ${entry.sleepTime} to ${entry.wakeTime} (${entry.sleepHours}h total).
      - Energy Level: ${entry.energyLevel}/10.
      - Nutrition: ${entry.nutritionLog}
      - Physical: Steps ${entry.steps}, Exercise ${entry.exerciseMinutes}m.

      **Output & Mental State:**
      - Mood: ${entry.mood} (Intensity: ${entry.moodIntensity}).
      - Productivity Score: ${entry.productivityScore}/100.
      - Deep Work: ${entry.deepWorkBlocks} blocks.
      - Tasks: "${entry.tasksCompleted}"
      - Reflection: "${entry.summary}"

      **Cross-Module Analysis Required:**
      Does their Sleep Duration explain their Mood?
      Does their Food choice explain their Energy slump?
      
      Return response in Markdown:

      ### 🧬 Bio-Digital Correlation
      * **Primary Link:** [e.g. "Low Sleep (5h) correlated with 40% drop in Deep Work"]
      * **Energy State:** ${entry.energyLevel > 7 ? 'Optimized' : 'Compromised'}

      ### 🧠 Super-Brain Directive
      **Observation:** [One specific insight on how their biology impacted their day]
      
      **Protocol for Tomorrow:** [One actionable bio-hack, e.g., "Shift bedtime to 10pm to recover Energy Buffer"]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Orbit is offline. Please try again.";
  } catch (error) {
    console.error("Orbit AI Error:", error);
    return "Orbit connectivity issue. Please check API Key.";
  }
};

export const generateTrendAnalysis = async (
  logs: DailyEntry[],
  rangeLabel: string
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("MISSING API KEY: Please add 'API_KEY' to your Vercel Environment Variables and redeploy.");
        return "Configuration Error: API Key is missing in deployment settings.";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Simplify logs to save token space
    const simplifiedLogs = logs.map(l => ({
      date: l.date,
      sleepHrs: l.sleepHours,
      mood: l.mood,
      energy: l.energyLevel,
      score: l.dayScore
    }));

    const prompt = `
      You are the OmniLife Trend Engine.
      Period: ${rangeLabel}.

      Data: ${JSON.stringify(simplifiedLogs)}

      Identify long-term patterns between Sleep Stability and Day Score.
      
      Report Structure (Markdown):
      ## 🔮 Long-Range Bio-Analysis
      ### 1. The Sleep-Performance Loop
      [Analyze correlation]

      ### 2. Energy Rhythm
      [Identify if energy dips on specific days]

      ### 3. Optimization Strategy
      [One high-level strategy]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate trend analysis.";
  } catch (error) {
    console.error("Orbit AI Error:", error);
    return "Orbit connectivity issue. Please check API Key.";
  }
};