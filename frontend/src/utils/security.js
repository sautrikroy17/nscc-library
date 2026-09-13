// ─────────────────────────────────────────────────────────────
// LibraX Enterprise Security & Inspection Protection
// SRM Institute of Science and Technology Central Library
// ─────────────────────────────────────────────────────────────

/**
 * Encrypts or obfuscates sensitive string data for client storage
 */
export function encryptData(data) {
  try {
    const jsonStr = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonStr));
  } catch {
    return null;
  }
}

/**
 * Decrypts or decodes sensitive string data from client storage
 */
export function decryptData(cipherText) {
  try {
    const jsonStr = decodeURIComponent(atob(cipherText));
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Initializes frontend client protection against inspection and unauthorized extraction
 */
export function initializeSecurityProtection() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // 1. Disable Right-Click Context Menu
  window.addEventListener('contextmenu', (e) => {
    // Allow right click only on text inputs if needed for spellcheck, block everywhere else
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // 2. Block Inspect Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspect)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+J / Cmd+Option+J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+U (View Page Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Silence and sanitize console in production
  if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
    const noop = () => {};
    try {
      console.log = noop;
      console.debug = noop;
      console.info = noop;
      console.dir = noop;
    } catch {}
  }

  // 4. Security Warning Banner in Console
  setTimeout(() => {
    try {
      console.clear();
      const style1 = 'color: #0ea5e9; font-size: 22px; font-weight: 800; font-family: sans-serif;';
      const style2 = 'color: #ef4444; font-size: 14px; font-weight: bold;';
      const style3 = 'color: #64748b; font-size: 12px;';
      console.warn('%c🔒 LibraX Portal — End-to-End Protected Environment', style1);
      console.warn('%cSTOP! Unauthorized inspection or modification of institutional tokens is prohibited.', style2);
      console.warn('%cSRM Institute of Science and Technology · Central Library Authentication Mesh v3.4', style3);
    } catch {}
  }, 1000);
}
