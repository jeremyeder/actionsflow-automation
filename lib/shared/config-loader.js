/**
 * Shared Config Loader
 *
 * Loads and parses sources.md configuration file.
 */

const fs = require("fs").promises;
const path = require("path");

const SOURCES_FILE = path.join(__dirname, "../../config/sources.md");

/**
 * Load sources from config/sources.md
 * @returns {Promise<Object>} Sources object with arrays for each type
 */
async function loadSources() {
  try {
    const content = await fs.readFile(SOURCES_FILE, "utf8");
    return parseMarkdownSources(content);
  } catch (err) {
    console.error(`Error loading sources.md: ${err.message}`);
    return {
      githubRepos: [],
      subreddits: [],
      twitterAccounts: [],
      peopleWatcherRepos: [],
    };
  }
}

/**
 * Parse markdown sources file
 * @param {string} content - Markdown file content
 * @returns {Object} Parsed sources
 */
function parseMarkdownSources(content) {
  const sources = {
    githubRepos: [],
    subreddits: [],
    twitterAccounts: [],
    peopleWatcherRepos: [],
  };

  const lines = content.split("\n");
  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Detect sections
    if (trimmed.startsWith("## GitHub Repositories")) {
      currentSection = "githubRepos";
      continue;
    } else if (trimmed.startsWith("## Twitter Accounts")) {
      currentSection = "twitterAccounts";
      continue;
    } else if (trimmed.startsWith("## Reddit Subreddits")) {
      currentSection = "subreddits";
      continue;
    } else if (trimmed.startsWith("## People Watcher Target Repos")) {
      currentSection = "peopleWatcherRepos";
      continue;
    } else if (trimmed.startsWith("##")) {
      currentSection = null;
      continue;
    }

    // Skip comment lines (single #)
    if (trimmed.startsWith("#")) {
      continue;
    }

    // Parse items (markdown list format: - item)
    if (trimmed.startsWith("-") && currentSection) {
      const item = trimmed.substring(1).trim();

      if (currentSection === "githubRepos") {
        sources.githubRepos.push(item);
      } else if (currentSection === "twitterAccounts") {
        // Remove @ prefix if present
        const account = item.replace(/^@/, "");
        sources.twitterAccounts.push(account);
      } else if (currentSection === "subreddits") {
        // Remove r/ prefix if present
        const subreddit = item.replace(/^r\//, "");
        sources.subreddits.push(subreddit);
      } else if (currentSection === "peopleWatcherRepos") {
        sources.peopleWatcherRepos.push(item);
      }
    }
  }

  console.log(`Loaded sources:`);
  console.log(`  GitHub Repos: ${sources.githubRepos.length}`);
  console.log(`  Twitter Accounts: ${sources.twitterAccounts.length}`);
  console.log(`  Reddit Subreddits: ${sources.subreddits.length}`);
  console.log(`  People Watcher Repos: ${sources.peopleWatcherRepos.length}`);

  return sources;
}

module.exports = {
  loadSources,
  parseMarkdownSources,
};
