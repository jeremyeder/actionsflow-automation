/**
 * Shared State Manager
 *
 * Git operations for committing and pushing state files.
 * Uses execFile for security instead of shell commands.
 */

const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

/**
 * Configure git user for commits
 * @returns {Promise<void>}
 */
async function configureGit() {
  try {
    await execFileAsync("git", ["config", "user.name", "GitHub Actions Bot"]);
    await execFileAsync("git", [
      "config",
      "user.email",
      "actions@github.com",
    ]);
    console.log("Git user configured");
  } catch (err) {
    console.error(`Error configuring git: ${err.message}`);
    throw err;
  }
}

/**
 * Commit and push state files
 * @param {Array<string>} files - Array of file paths to commit
 * @param {string} message - Commit message
 * @returns {Promise<boolean>} True if changes committed, false if no changes
 */
async function commitAndPushStateFiles(files, message) {
  try {
    await configureGit();

    // Add files
    for (const file of files) {
      await execFileAsync("git", ["add", file]);
      console.log(`Added ${file} to staging`);
    }

    // Check if there are changes
    try {
      await execFileAsync("git", ["diff", "--cached", "--quiet"]);
      console.log("No changes to commit");
      return false;
    } catch (err) {
      // Non-zero exit means there are changes - proceed
    }

    // Commit
    await execFileAsync("git", ["commit", "-m", message]);
    console.log(`Committed: ${message}`);

    // Push
    await execFileAsync("git", ["push"]);
    console.log("Pushed to remote");

    return true;
  } catch (err) {
    console.error(`Error in git operations: ${err.message}`);
    throw err;
  }
}

module.exports = {
  configureGit,
  commitAndPushStateFiles,
};
