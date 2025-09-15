<script>
  export let sidebarCollapsed = false;
  export let sidebarOpen = false;
  export let toggleSidebar;
  export let currentPath = '/';
  export let menuItems = [
    { icon: '🏠', label: 'Dashboard', href: '/' },
    { icon: '👥', label: 'Users', href: '/users' },
    { icon: '📦', label: 'Products', href: '/products' },
    { icon: '📊', label: 'Analytics', href: '/analytics' },
    { icon: '📝', label: 'Forms', href: '/forms' },
    { icon: '🎨', label: 'UI Elements', href: '/ui-elements' },
    { icon: '📈', label: 'Charts', href: '/charts' },
    { icon: '🗓️', label: 'Calendar', href: '/calendar' },
    { icon: '⚙️', label: 'Settings', href: '/settings' }
  ];
</script>

<aside class="admin-sidebar {sidebarCollapsed ? 'collapsed' : ''} {sidebarOpen ? 'open' : ''}">
  <div class="sidebar-header">
    {#if !sidebarCollapsed}
      <a href="/" class="sidebar-brand">PureAdmin</a>
    {/if}
    <button class="sidebar-toggle" on:click={toggleSidebar}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  </div>

  <nav class="sidebar-nav">
    <ul>
      {#each menuItems as item}
        <li class="sidebar-nav-item">
          <a
            href={item.href}
            class="sidebar-nav-link {currentPath === item.href ? 'active' : ''}"
            title={sidebarCollapsed ? item.label : ''}
          >
            <span class="sidebar-nav-icon">{item.icon}</span>
            <span class="sidebar-nav-text">{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="sidebar-footer">
    <div class="sidebar-user">
      {#if !sidebarCollapsed}
        <div class="user-info">
          <div class="user-name">Admin User</div>
          <div class="user-role">Administrator</div>
        </div>
      {/if}
    </div>
  </div>
</aside>

<style>
  .sidebar-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    font-weight: 600;
    color: white;
    font-size: 0.875rem;
  }

  .user-role {
    font-size: 0.75rem;
    color: var(--sidebar-text);
  }

  .admin-sidebar.collapsed .sidebar-footer {
    padding: 0.5rem;
  }

  .admin-sidebar.collapsed .user-info {
    display: none;
  }
</style>