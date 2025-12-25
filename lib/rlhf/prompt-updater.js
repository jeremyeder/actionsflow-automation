/**
 * RLHF Prompt Updater
 *
 * Updates system-prompt.txt with learned preferences from user reactions.
 */

const fs = require("fs").promises;

const RLHF_SECTION_MARKER = "## RLHF Learned Preferences";

/**
 * Update system prompt with learned preferences
 * @param {string} promptPath - Path to system-prompt.txt
 * @param {Object} preferences - Preferences object from reaction analysis
 * @returns {Promise<string>} Updated prompt text
 */
async function updateSystemPrompt(promptPath, preferences) {
  try {
    const existingPrompt = await fs.readFile(promptPath, "utf8");

    const preferenceSection = generatePreferenceText(preferences);

    let updatedPrompt;

    // Check if RLHF section exists
    if (existingPrompt.includes(RLHF_SECTION_MARKER)) {
      // Replace existing section
      const parts = existingPrompt.split(RLHF_SECTION_MARKER);
      updatedPrompt = `${parts[0]}${RLHF_SECTION_MARKER}\n\n${preferenceSection}`;
    } else {
      // Append new section
      updatedPrompt = `${existingPrompt}\n\n${RLHF_SECTION_MARKER}\n\n${preferenceSection}`;
    }

    await fs.writeFile(promptPath, updatedPrompt, "utf8");
    console.log(`Updated system prompt with RLHF preferences`);

    return updatedPrompt;
  } catch (err) {
    console.error(`Error updating system prompt: ${err.message}`);
    throw err;
  }
}

/**
 * Generate preference text for system prompt
 * @param {Object} preferences - Preferences object
 * @returns {string} Formatted preference text
 */
function generatePreferenceText(preferences) {
  let text = `Based on your feedback from recent signals:\n\n`;

  if (preferences.liked.length > 0) {
    text += `### Signals You Found Valuable\n\n`;
    text += `You reacted positively to these types of signals:\n\n`;

    preferences.liked.slice(0, 10).forEach((item, i) => {
      text += `${i + 1}. [+${item.score}] ${extractTitle(item.content)}\n`;
    });

    text += `\n`;
  }

  if (preferences.disliked.length > 0) {
    text += `### Signals You Found Less Valuable\n\n`;
    text += `You reacted negatively to these types of signals:\n\n`;

    preferences.disliked.slice(0, 10).forEach((item, i) => {
      text += `${i + 1}. [${item.score}] ${extractTitle(item.content)}\n`;
    });

    text += `\n`;
  }

  text += `When selecting signals, prioritize content similar to the valued signals and avoid content similar to the low-value signals.\n`;

  return text;
}

/**
 * Extract title from comment content
 * @param {string} content - Comment body
 * @returns {string} Extracted title or truncated content
 */
function extractTitle(content) {
  // Look for ## Signal N: title pattern
  const titleMatch = content.match(/## Signal \d+: (.+)/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Look for first line
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length > 0) {
    return lines[0].trim().substring(0, 100);
  }

  return content.substring(0, 100);
}

module.exports = {
  updateSystemPrompt,
  generatePreferenceText,
  extractTitle,
};
