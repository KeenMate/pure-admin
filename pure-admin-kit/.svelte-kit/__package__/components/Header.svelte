<script>
  export let toggleSidebar;

  let showUserMenu = false;
  let showNotifications = false;

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
    showNotifications = false;
  }

  function toggleNotifications() {
    showNotifications = !showNotifications;
    showUserMenu = false;
  }
</script>

<header class="admin-header">
  <div class="header-left">
    <button class="header-menu-toggle" on:click={toggleSidebar}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <div class="header-search">
      <input type="text" placeholder="Search..." class="pure-input search-input" />
    </div>
  </div>

  <div class="header-right">
    <button class="header-icon-btn" on:click={toggleNotifications}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span class="notification-badge">3</span>
    </button>

    <button class="header-icon-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    </button>

    <div class="header-user-menu">
      <button class="user-menu-trigger" on:click={toggleUserMenu}>
        <div class="user-avatar">A</div>
        <span class="user-name-display">Admin</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {#if showUserMenu}
        <div class="user-dropdown">
          <a href="/profile" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </a>
          <a href="/settings" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 8.76l4.24 4.24m12.44 0l4.24 4.24M1.54 15.24l4.24-4.24"></path>
            </svg>
            Settings
          </a>
          <div class="dropdown-divider"></div>
          <a href="/logout" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </a>
        </div>
      {/if}
    </div>

    {#if showNotifications}
      <div class="notifications-dropdown">
        <div class="dropdown-header">Notifications</div>
        <div class="notification-item">
          <div class="notification-icon bg-primary">📧</div>
          <div class="notification-content">
            <div class="notification-title">New message received</div>
            <div class="notification-time">5 minutes ago</div>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-icon bg-success">✅</div>
          <div class="notification-content">
            <div class="notification-title">Task completed</div>
            <div class="notification-time">1 hour ago</div>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-icon bg-warning">⚠️</div>
          <div class="notification-content">
            <div class="notification-title">System update available</div>
            <div class="notification-time">2 hours ago</div>
          </div>
        </div>
        <a href="/notifications" class="dropdown-footer">View all notifications</a>
      </div>
    {/if}
  </div>
</header>

<style>
  .header-menu-toggle {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--dark-color);
    display: none;
  }

  @media (max-width: 768px) {
    .header-menu-toggle {
      display: block;
    }
  }

  .header-search {
    margin-left: 1rem;
  }

  .search-input {
    border: 1px solid var(--border-color);
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    width: 300px;
  }

  @media (max-width: 768px) {
    .header-search {
      display: none;
    }
  }

  .header-icon-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--dark-color);
    position: relative;
  }

  .notification-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: var(--danger-color);
    color: white;
    font-size: 0.625rem;
    padding: 0.125rem 0.25rem;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
  }

  .header-user-menu {
    position: relative;
  }

  .user-menu-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--dark-color);
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .user-name-display {
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .user-name-display {
      display: none;
    }
  }

  .user-dropdown,
  .notifications-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    z-index: 1000;
    margin-top: 0.5rem;
  }

  .notifications-dropdown {
    width: 320px;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--dark-color);
    text-decoration: none;
    transition: background 0.2s;
  }

  .dropdown-item:hover {
    background: var(--light-color);
  }

  .dropdown-divider {
    height: 1px;
    background: var(--border-color);
    margin: 0.5rem 0;
  }

  .dropdown-header {
    padding: 0.75rem 1rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
  }

  .notification-item {
    display: flex;
    align-items: start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .notification-item:hover {
    background: var(--light-color);
  }

  .notification-icon {
    width: 36px;
    height: 36px;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notification-content {
    flex: 1;
  }

  .notification-title {
    font-size: 0.875rem;
    color: var(--dark-color);
  }

  .notification-time {
    font-size: 0.75rem;
    color: var(--secondary-color);
    margin-top: 0.25rem;
  }

  .dropdown-footer {
    display: block;
    text-align: center;
    padding: 0.75rem;
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.875rem;
    border-top: 1px solid var(--border-color);
  }

  .dropdown-footer:hover {
    background: var(--light-color);
  }
</style>