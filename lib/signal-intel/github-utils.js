/**
 * Signal Intelligence GitHub Utilities
 *
 * GitHub API operations for creating issues, posting comments, and reading reactions.
 */

const { Octokit } = require("@octokit/rest");

/**
 * Get authenticated Octokit instance
 * @returns {Octokit} Octokit client
 */
function getOctokit() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

/**
 * Create GitHub issue with labels
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} title - Issue title
 * @param {string} body - Issue body (markdown)
 * @param {Array<string>} labels - Array of label names
 * @returns {Promise<Object>} Created issue data
 */
async function createLabeledIssue(owner, repo, title, body, labels = []) {
  const octokit = getOctokit();

  try {
    const { data } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
      labels,
    });

    console.log(`Created issue #${data.number}: ${title}`);
    console.log(`  URL: ${data.html_url}`);

    return data;
  } catch (err) {
    console.error(`Error creating issue: ${err.message}`);
    throw err;
  }
}

/**
 * Post comment to GitHub issue
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @param {string} body - Comment body (markdown)
 * @returns {Promise<Object>} Created comment data
 */
async function postComment(owner, repo, issueNumber, body) {
  const octokit = getOctokit();

  try {
    const { data } = await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });

    console.log(`  Posted comment to issue #${issueNumber}`);

    return data;
  } catch (err) {
    console.error(`Error posting comment: ${err.message}`);
    throw err;
  }
}

/**
 * Get reactions for all comments on an issue
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @returns {Promise<Array>} Array of comment objects with reactions
 */
async function getReactionsForComments(owner, repo, issueNumber) {
  const octokit = getOctokit();

  try {
    // Get all comments
    const { data: comments } = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const reactionsData = [];

    // Get reactions for each comment
    for (const comment of comments) {
      const { data: reactions } = await octokit.reactions.listForIssueComment({
        owner,
        repo,
        comment_id: comment.id,
      });

      // Aggregate reactions by type
      const reactionCounts = reactions.reduce((acc, r) => {
        acc[r.content] = (acc[r.content] || 0) + 1;
        return acc;
      }, {});

      reactionsData.push({
        commentId: comment.id,
        commentBody: comment.body,
        commentUrl: comment.html_url,
        reactions: reactionCounts,
      });
    }

    console.log(
      `Fetched reactions for ${reactionsData.length} comments on issue #${issueNumber}`
    );
    return reactionsData;
  } catch (err) {
    console.error(`Error fetching reactions: ${err.message}`);
    throw err;
  }
}

/**
 * Get issues with specific label since a date
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} label - Label to filter by
 * @param {string} since - ISO 8601 timestamp
 * @returns {Promise<Array>} Array of issue objects
 */
async function getIssuesWithLabel(owner, repo, label, since) {
  const octokit = getOctokit();

  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      labels: label,
      since,
      state: "all",
    });

    console.log(
      `Found ${issues.length} issues with label "${label}" since ${since}`
    );
    return issues;
  } catch (err) {
    console.error(`Error fetching issues: ${err.message}`);
    throw err;
  }
}

module.exports = {
  createLabeledIssue,
  postComment,
  getReactionsForComments,
  getIssuesWithLabel,
};
