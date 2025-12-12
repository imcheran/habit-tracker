import { Habit, HabitStats, DailyEntry } from '../types';

declare var process: any;

// Helper to check for API Key presence
const getApiKey = (): string | null => {
  try {
      // @ts-ignore
      return process.env.API_KEY || null;
  } catch (e) {
      console.warn("API Key access failed or key is missing.");
      return null;
  }
};

// Generic Helper to call Groq API (Llama 3)
const callGroqAPI = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    const apiKey = getApiKey();
    
    if (!apiKey) {
        throw new Error("MISSING_KEY");
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: "llama3-70b-8192", // High intelligence, very fast, free tier
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error("Groq API Error:", err);
            throw new Error("API_ERROR");
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "No response generated.";
    } catch (error) {
        console.error("Groq Network Error:", error);
        throw error;
    }
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
    const jsonData = formatDataForAI(habits, stats);
    
    const systemPrompt = `You are the "OmniLife Super-Brain," a bio-digital system analyzing a user's habits. 
    If the user is in "Hero Mode", speak like a Tactical AI Commander.
    If the user is in "Zen Mode", speak like a Stoic Philosopher.
    Keep responses concise, formatted in Markdown, and avoid conversational filler.`;

    const userPrompt = `Analyze this performance data:
      ${jsonData}

      Required Output Structure:
      1. **System Status**: Brief performance summary.
      2. **Critical Weakness**: Identify one 'At Risk' habit.
      3. **Strategic Protocol**: One specific action to fix it.
      4. **Inspirational Directive**: Short quote or command.`;

    return await callGroqAPI(systemPrompt, userPrompt);

  } catch (error: any) {
    if (error.message === "MISSING_KEY") {
        return "Configuration Error: API Key is missing. Please add your Groq key as 'API_KEY' in your environment variables.";
    }
    return "AI Service is currently unavailable. Please check your internet connection.";
  }
};

export const generateOrbitAnalysis = async (
  entry: DailyEntry
): Promise<string> => {
  try {
    const systemPrompt = `You are the "OmniLife Super-Brain." Your goal is to find hidden correlations between biology and behavior. Return response in Markdown.`;
    
    const userPrompt = `
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

      Analyze: Does Sleep Duration explain Mood? Does Food choice explain Energy slump?

      Required Output Structure:
      ### 🧬 Bio-Digital Correlation
      * **Primary Link:** [e.g. "Low Sleep (5h) correlated with 40% drop in Deep Work"]
      * **Energy State:** ${entry.energyLevel > 7 ? 'Optimized' : 'Compromised'}

      ### 🧠 Super-Brain Directive
      **Observation:** [One specific insight on how their biology impacted their day]
      **Protocol for Tomorrow:** [One actionable bio-hack]
    `;

    return await callGroqAPI(systemPrompt, userPrompt);

  } catch (error: any) {
    if (error.message === "MISSING_KEY") {
        return "Configuration Error: Missing API Key.";
    }
    return "Orbit is offline. Please try again.";
  }
};

export const generateTrendAnalysis = async (
  logs: DailyEntry[],
  rangeLabel: string
): Promise<string> => {
  try {
    // Simplify logs to save token space
    const simplifiedLogs = logs.map(l => ({
      date: l.date,
      sleepHrs: l.sleepHours,
      mood: l.mood,
      energy: l.energyLevel,
      score: l.dayScore
    }));

    const systemPrompt = `You are the OmniLife Trend Engine. Analyze long-term patterns between Sleep Stability and Day Score. Use Markdown.`;

    const userPrompt = `
      Period: ${rangeLabel}.
      Data: ${JSON.stringify(simplifiedLogs)}

      Report Structure:
      ## 🔮 Long-Range Bio-Analysis
      ### 1. The Sleep-Performance Loop
      [Analyze correlation]

      ### 2. Energy Rhythm
      [Identify if energy dips on specific days]

      ### 3. Optimization Strategy
      [One high-level strategy]
    `;

    return await callGroqAPI(systemPrompt, userPrompt);

  } catch (error: any) {
    if (error.message === "MISSING_KEY") {
        return "Configuration Error: Missing API Key.";
    }
    return "Trend analysis unavailable.";
  }
};