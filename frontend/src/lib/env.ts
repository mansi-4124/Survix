/**
 * Validates runtime environment variables.
 * Logs warnings in development for missing optional config.
 */
export function validateEnv(): void {
  if (import.meta.env.DEV) {
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase === undefined || apiBase === "") {
      // Empty is valid for dev (uses Vite proxy)
    }
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.info(
        "[Survix] VITE_GOOGLE_CLIENT_ID not set; Google sign-in will be disabled.",
      );
    }
  }
}
