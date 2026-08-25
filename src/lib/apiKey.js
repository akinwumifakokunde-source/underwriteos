// Local storage helper for the active sandbox API key.
// The key is set during onboarding and injected into every SDK function
// invocation as _api_key so the backend resolves the organization from the
// key (not the dashboard session).

const STORAGE_KEY = "uwos_sandbox_api_key";

export function getApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setApiKey(key) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function clearApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasApiKey() {
  return getApiKey().length > 0;
}

// Inject _api_key into a payload for base44.functions.invoke.
export function withApiKey(payload = {}) {
  const key = getApiKey();
  return key ? { ...payload, _api_key: key } : payload;
}