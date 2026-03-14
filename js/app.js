// Generic frontend logic shared across multiple pages.  The functions
// defined here handle user authentication, storing session data in
// ``sessionStorage`` and redirecting users based on their roles.  Other
// modules may import helper functions such as ``checkAuth`` or ``logout``.

/**
 * Attempt to log a user in using the backend API.  On success the user
 * information is stored in ``sessionStorage`` under the key ``crypeUser``.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} Resolves with the user object on success
 * or throws an error on failure.
 */
async function login(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = data && data.error ? data.error : 'Error desconocido';
    throw new Error(error);
  }
  const result = await response.json();
  // Persist user session data in browser storage.  Note: the real
  // authentication is maintained via server session cookies; this is
  // primarily for client‑side convenience (role-based navigation).
  sessionStorage.setItem('crypeUser', JSON.stringify(result.user));
  return result.user;
}

/**
 * Clear the session both client side and server side.  Removes
 * ``crypeUser`` from ``sessionStorage`` and calls the backend to destroy
 * the session.  Redirects to the login page when complete.
 */
async function logout() {
  await fetch('/api/logout', { method: 'POST' }).catch(() => {});
  sessionStorage.removeItem('crypeUser');
  window.location.href = 'index.html';
}

/**
 * Retrieve the stored user from ``sessionStorage`` or ``null`` if not
 * logged in.  This does not verify the server session; you should
 * combine this with a call to a protected endpoint for full assurance.
 */
function getCurrentUser() {
  const data = sessionStorage.getItem('crypeUser');
  return data ? JSON.parse(data) : null;
}

/**
 * Require a logged in user in order to access the page.  If no user is
 * found, the browser is redirected to the login page.
 */
function checkAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
  }
  return user;
}

// Handle login form if present on this page
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorLabel = document.getElementById('loginError');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      try {
        const user = await login(username, password);
        // On successful login redirect to the dashboard regardless of role.
        window.location.href = 'dashboard.html';
      } catch (err) {
        errorLabel.textContent = err.message;
        errorLabel.style.display = 'block';
      }
    });
  }
});

// Export helpers for other modules to import if using bundlers.  When
// included via <script> tags these functions are attached to the global
// window object.
window.login = login;
window.logout = logout;
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
