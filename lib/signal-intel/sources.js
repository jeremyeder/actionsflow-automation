/**
 * Signal Intelligence Sources
 *
 * Fetches content from HackerNews, Reddit, and GitHub releases.
 * Twitter integration deferred due to Nitter instability.
 */

const axios = require("axios");
const { Octokit } = require("@octokit/rest");

const MAX_HN_STORIES = 30;
const MAX_REDDIT_POSTS = 30;
const MAX_GITHUB_RELEASES = 5;

/**
 * Fetch top stories from HackerNews
 * @returns {Promise<Array>} Array of story objects
 */
async function fetchHackerNews() {
  console.log("Fetching HackerNews top stories...");

  try {
    // Get top story IDs
    const topStoriesResponse = await axios.get(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { timeout: 10000 }
    );
    const storyIds = topStoriesResponse.data.slice(0, MAX_HN_STORIES);

    // Fetch story details in parallel
    const stories = await Promise.all(
      storyIds.map((id) =>
        axios
          .get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            timeout: 10000,
          })
          .catch((err) => {
            console.log(`Failed to fetch HN story ${id}: ${err.message}`);
            return null;
          })
      )
    );

    // Filter out failed fetches and format
    const validStories = stories
      .filter((res) => res !== null && res.data)
      .map((res) => ({
        title: res.data.title,
        url:
          res.data.url ||
          `https://news.ycombinator.com/item?id=${res.data.id}`,
        score: res.data.score,
        source: "HackerNews",
      }));

    console.log(`Fetched ${validStories.length} HackerNews stories`);
    return validStories;
  } catch (err) {
    console.error(`Error fetching HackerNews: ${err.message}`);
    return [];
  }
}

/**
 * Fetch top posts from Reddit subreddits
 * @param {Array<string>} subreddits - Subreddit names to fetch from
 * @returns {Promise<Array>} Array of post objects
 */
async function fetchReddit(subreddits = []) {
  console.log(`Fetching Reddit posts from ${subreddits.length} subreddits...`);

  const posts = [];

  for (const sub of subreddits) {
    try {
      const response = await axios.get(
        `https://www.reddit.com/r/${sub}/top.json?limit=${MAX_REDDIT_POSTS}&t=day`,
        {
          headers: { "User-Agent": "Actionsflow-Signal-Intel/1.0" },
          timeout: 10000,
        }
      );

      const subPosts = response.data.data.children.map((post) => ({
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        score: post.data.score,
        subreddit: sub,
        source: "Reddit",
      }));

      posts.push(...subPosts);
      console.log(`Fetched ${subPosts.length} posts from r/${sub}`);
    } catch (err) {
      console.error(`Error fetching r/${sub}: ${err.message}`);
    }
  }

  console.log(`Fetched ${posts.length} total Reddit posts`);
  return posts;
}

/**
 * Fetch recent releases from GitHub repositories
 * @param {Array<string>} repos - Repository names in "owner/repo" format
 * @returns {Promise<Array>} Array of release objects
 */
async function fetchGitHubReleases(repos = []) {
  console.log(
    `Fetching GitHub releases from ${repos.length} repositories...`
  );

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const releases = [];

  for (const repo of repos) {
    try {
      const [owner, repoName] = repo.split("/");

      if (!owner || !repoName) {
        console.log(`Invalid repo format: ${repo} (expected owner/repo)`);
        continue;
      }

      const { data } = await octokit.repos.listReleases({
        owner,
        repo: repoName,
        per_page: MAX_GITHUB_RELEASES,
      });

      const repoReleases = data.map((release) => ({
        title: `${repo}: ${release.name || release.tag_name}`,
        url: release.html_url,
        score: 0, // GitHub releases don't have scores
        source: "GitHub",
        repository: repo,
      }));

      releases.push(...repoReleases);
      console.log(`Fetched ${repoReleases.length} releases from ${repo}`);
    } catch (err) {
      console.error(`Error fetching releases from ${repo}: ${err.message}`);
    }
  }

  console.log(`Fetched ${releases.length} total GitHub releases`);
  return releases;
}

/**
 * Fetch Twitter posts (deferred - not implemented)
 * @returns {Promise<Array>} Empty array
 */
async function fetchTwitter() {
  console.log("Twitter integration deferred - returning empty array");
  return [];
}

module.exports = {
  fetchHackerNews,
  fetchReddit,
  fetchGitHubReleases,
  fetchTwitter,
};
