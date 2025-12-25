/**
 * People Watcher Scoring
 *
 * Scores and ranks contributors based on activity metrics.
 */

/**
 * Score a contributor based on activity
 * @param {Object} contributor - Contributor object
 * @returns {number} Score
 */
function scoreCandidate(contributor) {
  let score = 0;

  // Base contribution score
  score += contributor.contributions * 2;

  // Multi-repo bonus
  score += contributor.repos.length * 10;

  return score;
}

/**
 * Rank candidates by score
 * @param {Array} candidates - Array of contributor objects
 * @returns {Array} Sorted array by score (highest first)
 */
function rankCandidates(candidates) {
  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * Format candidates as markdown
 * @param {Array} candidates - Array of scored contributor objects
 * @returns {string} Markdown content
 */
function formatCandidateMarkdown(candidates) {
  let markdown = `# People Watcher Candidates\n\n`;
  markdown += `*Last updated: ${new Date().toISOString()}*\n\n`;
  markdown += `## Top Contributors\n\n`;

  for (const candidate of candidates.slice(0, 20)) {
    markdown += `### ${candidate.username} (Score: ${candidate.score})\n\n`;
    markdown += `- **Contributions:** ${candidate.contributions}\n`;
    markdown += `- **Repositories:** ${candidate.repos.join(", ")}\n`;
    markdown += `- **GitHub:** ${candidate.htmlUrl}\n\n`;
  }

  return markdown;
}

module.exports = {
  scoreCandidate,
  rankCandidates,
  formatCandidateMarkdown,
};
