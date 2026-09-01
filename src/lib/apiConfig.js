// Single source of truth for API URLs. Never hardcode API URLs in components.
// The API version (v1) is included ONCE in the base URL. Endpoint paths are
// relative to the base (e.g. "/borrowers"), never "/v1/borrowers".
export const ENVIRONMENT_CONFIG = {
  API_VERSION: "v1",
  SANDBOX_API_BASE_URL: "https://api.underwriteos.dev/v1",
  PRODUCTION_API_BASE_URL: "https://api.creditdecide.com/v1", // production is live
};

export const API_BASE_URL = ENVIRONMENT_CONFIG.SANDBOX_API_BASE_URL;
export const API_VERSION = ENVIRONMENT_CONFIG.API_VERSION;
export const PRODUCTION_DEPLOYED = Boolean(ENVIRONMENT_CONFIG.PRODUCTION_API_BASE_URL);
export const PRODUCTION_API_BASE_URL = ENVIRONMENT_CONFIG.PRODUCTION_API_BASE_URL;