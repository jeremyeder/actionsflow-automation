/**
 * RLHF Reaction Analyzer
 *
 * Analyzes thumbs up/down reactions on GitHub issue comments
 * to learn user preferences for signal selection.
 */

/**
 * Analyze reactions from issues to extract preferences
 * @param {Array} issuesWithReactions - Array of issue objects with reaction data
 * @returns {Object} Preferences object with liked/disliked signals
 */
function analyzeReactions(issuesWithReactions) {
  const preferences = {
    liked: [],
    disliked: [],
    neutral: [],
  };

  for (const issue of issuesWithReactions) {
    for (const comment of issue.comments) {
      const upvotes = comment.reactions["+1"] || 0;
      const downvotes = comment.reactions["-1"] || 0;

      const sentiment = upvotes - downvotes;

      const entry = {
        content: comment.commentBody,
        url: comment.commentUrl,
        score: sentiment,
        upvotes: upvotes,
        downvotes: downvotes,
        issueTitle: issue.title,
      };

      if (sentiment > 0) {
        preferences.liked.push(entry);
      } else if (sentiment < 0) {
        preferences.disliked.push(entry);
      } else if (upvotes > 0 || downvotes > 0) {
        preferences.neutral.push(entry);
      }
    }
  }

  // Sort by absolute sentiment score
  preferences.liked.sort((a, b) => b.score - a.score);
  preferences.disliked.sort((a, b) => a.score - b.score);

  console.log(`Analyzed reactions:`);
  console.log(`  Liked: ${preferences.liked.length}`);
  console.log(`  Disliked: ${preferences.disliked.length}`);
  console.log(`  Neutral: ${preferences.neutral.length}`);

  return preferences;
}

/**
 * Generate preference summary text for RLHF data
 * @param {Object} preferences - Preferences object
 * @returns {string} Summary text
 */
function generatePreferenceSummary(preferences) {
  let summary = `# RLHF Preference Summary\n\n`;

  if (preferences.liked.length > 0) {
    summary += `## Highly Valued Signals (+${preferences.liked.length})\n\n`;
    preferences.liked.slice(0, 5).forEach((item) => {
      summary += `- [+${item.score}] ${item.issueTitle}\n`;
      summary += `  ${item.url}\n\n`;
    });
  }

  if (preferences.disliked.length > 0) {
    summary += `## Low Value Signals (-${preferences.disliked.length})\n\n`;
    preferences.disliked.slice(0, 5).forEach((item) => {
      summary += `- [${item.score}] ${item.issueTitle}\n`;
      summary += `  ${item.url}\n\n`;
    });
  }

  return summary;
}

module.exports = {
  analyzeReactions,
  generatePreferenceSummary,
};
