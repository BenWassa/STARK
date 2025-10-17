// Version checking utilities for STARK PWA
const VERSION_CHECK_INTERVAL = 1000 * 60 * 60; // Check every hour
const VERSION_STORAGE_KEY = 'stark_last_version_check';
const DISMISSED_UPDATE_KEY = 'stark_dismissed_update';

export const checkForUpdates = async (currentVersion) => {
  try {
    // Check if we should skip checking (recently checked)
    const lastCheck = localStorage.getItem(VERSION_STORAGE_KEY);
    const now = Date.now();

    if (lastCheck && (now - parseInt(lastCheck)) < VERSION_CHECK_INTERVAL) {
      return null;
    }

    // Update last check time
    localStorage.setItem(VERSION_STORAGE_KEY, now.toString());

    // For GitHub Pages deployment, check against a version.json file
    // In production, this would be served from the same domain
    const response = await fetch('/version.json', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      // If version.json doesn't exist, try checking GitHub API for latest release
      return await checkGitHubForUpdates(currentVersion);
    }

    const versionData = await response.json();
    const latestVersion = versionData.version;

    if (isNewerVersion(latestVersion, currentVersion)) {
      // Check if user has dismissed this update
      const dismissedUpdate = localStorage.getItem(DISMISSED_UPDATE_KEY);
      if (dismissedUpdate === latestVersion) {
        return null;
      }

      return {
        available: true,
        latestVersion,
        currentVersion,
        releaseNotes: versionData.releaseNotes || null,
        downloadUrl: versionData.downloadUrl || null
      };
    }

    return null;
  } catch (error) {
    console.warn('Version check failed:', error);
    return null;
  }
};

const checkGitHubForUpdates = async (currentVersion) => {
  try {
    // Check GitHub releases API
    const response = await fetch('https://api.github.com/repos/BenWassa/STARK/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) return null;

    const release = await response.json();
    const latestVersion = release.tag_name.replace('v', ''); // Remove 'v' prefix if present

    if (isNewerVersion(latestVersion, currentVersion)) {
      const dismissedUpdate = localStorage.getItem(DISMISSED_UPDATE_KEY);
      if (dismissedUpdate === latestVersion) {
        return null;
      }

      return {
        available: true,
        latestVersion,
        currentVersion,
        releaseNotes: release.body || null,
        downloadUrl: release.html_url
      };
    }

    return null;
  } catch (error) {
    console.warn('GitHub version check failed:', error);
    return null;
  }
};

const isNewerVersion = (latest, current) => {
  if (!latest || !current) return false;

  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const latestPart = latestParts[i] || 0;
    const currentPart = currentParts[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
};

export const dismissUpdate = (version) => {
  localStorage.setItem(DISMISSED_UPDATE_KEY, version);
};

export const performUpdate = () => {
  // For PWA, trigger service worker update
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.update();
      });
    });
  }

  // Force page reload to get latest version
  window.location.reload();
};