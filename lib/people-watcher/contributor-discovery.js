/**
 * People Watcher Contributor Discovery
 *
 * Discovers active contributors from target GitHub repositories.
 */

const { Octokit } = require("@octokit/rest");

/**
 * Discover contributors from target repositories
 * @param {Array<string>} repos - Array of repo names (owner/repo)
 * @returns {Promise<Array>} Array of contributor objects
 */
async function discoverContributors(repos) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const contributors = new Map();

  console.log(`Discovering contributors from ${repos.length} repositories...`);

  for (const repo of repos) {
    try {
      const [owner, repoName] = repo.split("/");

      if (!owner || !repoName) {
        console.log(`Invalid repo format: ${repo}`);
        continue;
      }

      const { data } = await octokit.repos.listContributors({
        owner,
        repo: repoName,
        per_page: 50,
      });

      for (const contributor of data) {
        if (!contributors.has(contributor.login)) {
          contributors.set(contributor.login, {
            username: contributor.login,
            contributions: contributor.contributions,
            repos: [repo],
            avatarUrl: contributor.avatar_url,
            htmlUrl: contributor.html_url,
          });
        } else {
          const existing = contributors.get(contributor.login);
          existing.contributions += contributor.contributions;
          existing.repos.push(repo);
        }
      }

      console.log(`Discovered ${data.length} contributors from ${repo}`);
    } catch (err) {
      console.error(`Error fetching contributors from ${repo}: ${err.message}`);
    }
  }

  console.log(
    `Total unique contributors discovered: ${contributors.size}`
  );

  return Array.from(contributors.values());
}

module.exports = {
  discoverContributors,
};
