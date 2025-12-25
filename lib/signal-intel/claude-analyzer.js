/**
 * Signal Intelligence Claude Analyzer
 *
 * Analyzes signals using Claude API and selects top 5 most relevant.
 */

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs").promises;

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 4096;
const TOP_SIGNALS_COUNT = 5;

/**
 * Analyze signals with Claude and select top N
 * @param {Array} signals - Array of signal objects
 * @param {string} systemPromptPath - Path to system prompt file
 * @param {number} topN - Number of top signals to return (default: 5)
 * @returns {Promise<Array>} Array of top signal objects with analysis
 */
async function analyzeSignals(
  signals,
  systemPromptPath,
  topN = TOP_SIGNALS_COUNT
) {
  if (!signals || signals.length === 0) {
    console.log("No signals to analyze");
    return [];
  }

  console.log(
    `Analyzing ${signals.length} signals with Claude to select top ${topN}...`
  );

  try {
    // Load system prompt
    const systemPrompt = await fs.readFile(systemPromptPath, "utf8");

    // Initialize Claude client
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Format signals for Claude
    const signalsText = formatSignalsForClaude(signals);

    // Create Claude message
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Analyze these ${signals.length} signals and select the top ${topN} most interesting and relevant ones.

For each selected signal, provide:
1. The signal title and URL (preserve as given)
2. Why it matters
3. A suggested action (Read now, Create issue, Share with team, or Ignore)
4. Brief analysis (1-2 sentences)

Format your response as a numbered list where each item contains:
- URL: [the URL from the signal]
- Title: [the title]
- Why it matters: [reason]
- Action: [suggested action]
- Analysis: [your analysis]

Here are the signals:

${signalsText}`,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].text;
    const topSignals = parseClaudeResponse(responseText, signals, topN);

    console.log(`Claude selected ${topSignals.length} top signals`);
    return topSignals;
  } catch (err) {
    console.error(`Error calling Claude API: ${err.message}`);
    throw err;
  }
}

/**
 * Format signals for Claude input
 * @param {Array} signals - Array of signal objects
 * @returns {string} Formatted string
 */
function formatSignalsForClaude(signals) {
  return signals
    .map((signal, index) => {
      const score = signal.score ? ` (score: ${signal.score})` : "";
      return `${index + 1}. [${signal.source}] ${signal.title}${score}\n   URL: ${signal.url}`;
    })
    .join("\n\n");
}

/**
 * Parse Claude's response to get top signals
 * @param {string} responseText - Claude's response text
 * @param {Array} originalSignals - Original signal objects for reference
 * @param {number} topN - Number of top signals
 * @returns {Array} Array of signal objects with analysis
 */
function parseClaudeResponse(responseText, originalSignals, topN) {
  const topSignals = [];

  // Find URLs from response
  const urlPattern = /URL:\s*(https?:\/\/[^\s]+)/gi;
  const urls = [];
  let match;

  while ((match = urlPattern.exec(responseText)) !== null) {
    urls.push(match[1].trim());
  }

  // Match URLs to original signals
  for (const url of urls.slice(0, topN)) {
    const originalSignal = originalSignals.find((s) => s.url === url);

    if (originalSignal) {
      topSignals.push({
        ...originalSignal,
        analysis: responseText,
        selected: true,
      });
    }
  }

  // Fallback if parsing failed
  if (topSignals.length === 0) {
    console.warn("Failed to parse Claude response, using first N signals");
    return originalSignals.slice(0, topN).map((s) => ({
      ...s,
      analysis: "Claude analysis failed to parse. Fallback selection.",
      selected: true,
    }));
  }

  return topSignals;
}

module.exports = {
  analyzeSignals,
  formatSignalsForClaude,
  parseClaudeResponse,
};
