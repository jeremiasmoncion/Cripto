// Logic for the admin page.  Only users with the admin role may
// access this page.  Administrators can create new users and remove
// existing users (except themselves).  User information is fetched
// from the backend and displayed in a table.

document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  // Redirect non-admin users back to the dashboard
  if (!user || user.role !== 'admin') {
    alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
    window.location.href = 'dashboard.html';
    return;
  }
  // Show admin menu in sidebar (the sidebar is already active in this page)
  const adminMenu = document.getElementById('adminMenu');
  if (adminMenu) {
    adminMenu.style.display = 'block';
  }

  /**
   * Load the list of users from the backend and render them in the table.
   */
  async function loadUsers() {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('Error al obtener usuarios');
      }
      const users = await res.json();
      populateUserTable(users);
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los usuarios');
    }
  }

  /**
   * Populate the table with user rows.  Each row includes a delete
   * button except for the currently logged in user.
   *
   * @param {Array} users List of user objects
   */
  function populateUserTable(users) {
    const tbody = document.getElementById('userRows');
    tbody.innerHTML = '';
    users.forEach(u => {
      const row = document.createElement('tr');
      // ID
      const idTd = document.createElement('td');
      idTd.textContent = u.id;
      row.appendChild(idTd);
      // Username
      const userTd = document.createElement('td');
      userTd.textContent = u.username;
      row.appendChild(userTd);
      // Role
      const roleTd = document.createElement('td');
      roleTd.textContent = u.role;
      row.appendChild(roleTd);
      // Actions
      const actTd = document.createElement('td');
      if (u.id !== user.id) {
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.style.backgroundColor = '#dc3545';
        delBtn.style.color = '#fff';
        delBtn.style.border = 'none';
        delBtn.style.padding = '4px 8px';
        delBtn.style.borderRadius = '4px';
        delBtn.style.cursor = 'pointer';
        delBtn.addEventListener('click', () => deleteUser(u.id));
        actTd.appendChild(delBtn);
      } else {
        actTd.textContent = '-';
      }
      row.appendChild(actTd);
      tbody.appendChild(row);
    });
  }

  /**
   * Send a request to delete a user by id.  Reloads the user list on
   * success.  Users cannot delete themselves.
   *
   * @param {number} id
   */
  async function deleteUser(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data && data.error ? data.error : 'Error al eliminar usuario';
        alert(msg);
        return;
      }
      loadUsers();
    } catch (err) {
      // Logic for the admin page.  Only users with the admin role may
// access this page.  Administrators can create new users and remove
// existing users (except themselves).  User information is fetched
// from the backend and displayed in a table.

document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  // Redirect non-admin users back to the dashboard
  if (!user || user.role !== 'admin') {
    alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
    window.location.href = 'dashboard.html';
    return;
  }
  // Show admin menu in sidebar (the sidebar is already active in this page)
  const adminMenu = document.getElementById('adminMenu');
  if (adminMenu) {
    adminMenu.style.display = 'block';
  }

  /**
   * Load the list of users from the backend and render them in the table.
   */
  async function loadUsers() {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('Error al obtener usuarios');
      }
      const users = await res.json();
      populateUserTable(users);
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los usuarios');
    }
  }

  /**
   * Populate the table with user rows.  Each row includes a delete
   * button except for the currently logged in user.
   *
   * @param {Array} users List of user objects
   */
  function populateUserTable(users) {
    const tbody = document.getElementById('userRows');
    tbody.innerHTML = '';
    users.forEach(u => {
      const row = document.createElement('tr');
      // ID
      const idTd = document.createElement('td');
      idTd.textContent = u.id;
      row.appendChild(idTd);
      // Username
      const userTd = document.createElement('td');
      userTd.textContent = u.username;
      row.appendChild(userTd);
      // Role
      const roleTd = document.createElement('td');
      roleTd.textContent = u.role;
      row.appendChild(roleTd);
      // Actions
      const actTd = document.createElement('td');
      if (u.id !== user.id) {
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.style.backgroundColor = '#dc3545';
        delBtn.style.color = '#fff';
        delBtn.style.border = 'none';
        delBtn.style.padding = '4px 8px';
        delBtn.style.borderRadius = '4px';
        delBtn.style.cursor = 'pointer';
        delBtn.addEventListener('click', () => deleteUser(u.id));
        actTd.appendChild(delBtn);
      } else {
        actTd.textContent = '-';
      }
      row.appendChild(actTd);
      tbody.appendChild(row);
    });
  }

  /**
   * Send a request to delete a user by id.  Reloads the user list on
   * success.  Users cannot delete themselves.
   *
   * @param {number} id
   */
  async function deleteUser(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data && data.error ? data.error : 'Error al eliminar usuario';
        alert(msg);
        return;
      }
      loadUsers();
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar el usuario');
    }
  }

  // Handle create user form submission
  const form = document.getElementById('createUserForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data && data.error ? data.error : 'Error al crear usuario';
        alert(msg);
        return;
      }
      // Clear the form and reload users
      form.reset();
      loadUsers();
    } catch (err) {
      console.error(err);
      alert('Error al crear usuario');
    }
  });

  // Load users on initial page load
  loadUsers();
});

// Export navigate function to use in the sidebar
window.navigate = (page) => {
  if (page === 'dashboard') {
    window.location.href = 'dashboard.html';
  } else if (page === 'trade-log') {
    window.location.href = 'trade-log.html';
  } else if (page === 'admin') {
    window.location.href = 'admin.html';
  }
};console.error(err);
      alert('No se pudo eliminar el usuario');
    }
  }

  // Handle create user form submission
  const form = document.getElementById('createUserForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data && data.error ? data.error : 'Error al crear usuario';
        alert(msg);
        return;
      }
      // Clear the form and reload users
      form.reset();
      loadUsers();
    } catch (err) {
      console.error(err);
      alert('Error al crear usuario');
    }
  });

  // Load users on initial page load
  loadUsers();
});

// Export navigate function to use in the sidebar
window.navigate = (page) => {
  if (page === 'dashboard') {
    window.location.href = 'dashboard.html';
  } else if (page === 'trade-log') {
    window.location.href = 'trade-log.html';
  } else if (page === 'admin') {
    window.location.href = 'admin.html';
  }
};
