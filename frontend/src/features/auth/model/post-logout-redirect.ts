const POST_LOGOUT_REDIRECT_KEY = 'wallet-platform.post-logout-redirect';

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function markPostLogoutRedirectToHome() {
  getSessionStorage()?.setItem(POST_LOGOUT_REDIRECT_KEY, 'root');
}

export function shouldRedirectToHomeAfterLogout() {
  return getSessionStorage()?.getItem(POST_LOGOUT_REDIRECT_KEY) === 'root';
}

export function clearPostLogoutRedirect() {
  getSessionStorage()?.removeItem(POST_LOGOUT_REDIRECT_KEY);
}
