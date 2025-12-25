/**
 * Signal Intelligence Deduplication
 *
 * Manages URL deduplication with 7-day TTL using signals.json state file.
 */

const fs = require("fs").promises;
const path = require("path");

const SIGNALS_FILE = path.join(__dirname, "../../data/signals.json");
const DEDUP_DAYS = 7;

/**
 * Load signals from state file
 * @returns {Promise<Object>} Signals data object with signals array
 */
async function loadSignals() {
  try {
    const data = await fs.readFile(SIGNALS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("No existing signals.json, starting fresh");
      return { signals: [] };
    }
    console.error(`Error loading signals.json: ${err.message}`);
    return { signals: [] };
  }
}

/**
 * Save signals to state file
 * @param {Object} signalsData - Signals data object
 * @returns {Promise<void>}
 */
async function saveSignals(signalsData) {
  try {
    await fs.writeFile(
      SIGNALS_FILE,
      JSON.stringify(signalsData, null, 2),
      "utf8"
    );
    console.log(`Saved ${signalsData.signals.length} signals to state file`);
  } catch (err) {
    console.error(`Error saving signals.json: ${err.message}`);
    throw err;
  }
}

/**
 * Check if URL is new (not seen in last N days)
 * @param {string} url - URL to check
 * @param {Array} signals - Array of signal objects
 * @param {number} daysToCheck - Number of days to look back (default: 7)
 * @returns {boolean} True if URL is new, false if already seen
 */
function isNewUrl(url, signals, daysToCheck = DEDUP_DAYS) {
  const cutoffTime = Date.now() - daysToCheck * 24 * 60 * 60 * 1000;

  return !signals.some((signal) => {
    if (signal.url !== url) return false;

    const signalTime = new Date(signal.timestamp).getTime();
    return signalTime > cutoffTime;
  });
}

/**
 * Add signal to array
 * @param {Array} signals - Array of signal objects
 * @param {string} url - Signal URL
 * @param {string} title - Signal title
 * @param {string} source - Signal source
 * @returns {void}
 */
function addSignal(signals, url, title, source) {
  signals.push({
    url,
    title,
    source,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Remove signals older than N days
 * @param {Array} signals - Array of signal objects
 * @param {number} daysToKeep - Number of days to retain (default: 7)
 * @returns {Array} Cleaned array of signals
 */
function cleanOldSignals(signals, daysToKeep = DEDUP_DAYS) {
  const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

  const cleaned = signals.filter((signal) => {
    const signalTime = new Date(signal.timestamp).getTime();
    return signalTime > cutoffTime;
  });

  const removedCount = signals.length - cleaned.length;
  if (removedCount > 0) {
    console.log(
      `Removed ${removedCount} signals older than ${daysToKeep} days`
    );
  }

  return cleaned;
}

module.exports = {
  loadSignals,
  saveSignals,
  isNewUrl,
  addSignal,
  cleanOldSignals,
};
