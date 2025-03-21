<script>
  import { onMount, onDestroy } from "svelte";
  import SidebarModal from "./lib/SidebarModal.svelte";
  import "../public/stylesform.css";

  let isSidebarCollapsed = window.innerWidth < 1400;
  let isMobile = window.innerWidth < 800;
  let isSidebarHidden = isSidebarCollapsed;
  let isSidebarOverlay = false;

  let sidebar;
  let startY;

  function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
    updateSidebarClass();
  }

  function updateSidebarClass() {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");

    if (isMobile) {
      sidebar.classList.toggle("collapsed", isSidebarCollapsed);
      sidebar.classList.toggle("overlay", !isSidebarCollapsed);
      isSidebarHidden = false;
    } else {
      sidebar.classList.toggle("collapsed", isSidebarCollapsed);
      main.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
      isSidebarHidden = sidebar.classList.contains("collapsed");
    }

    isSidebarOverlay = sidebar.classList.contains("overlay");
    console.log("je overlay " + isSidebarOverlay);
  }

  onMount(() => {
    const sidebar = document.getElementById("sidebar");
    updateSidebarClass();

    const handleResize = () => {
      isSidebarCollapsed = window.innerWidth < 1400;
      isMobile = window.innerWidth < 800;

      updateSidebarClass();
    };

    const handleMouseEnter = () => {
      if (!isMobile && isSidebarCollapsed) {
        sidebar.classList.add("hover-expanded");
        sidebar.classList.remove("collapsed");
        isSidebarHidden = false;
      }
    };

    const handleMouseLeave = () => {
      if (!isMobile && isSidebarCollapsed) {
        sidebar.classList.remove("hover-expanded");
        sidebar.classList.add("collapsed");
        isSidebarHidden = true;
      }
    };

    const handleWheel = (event) => {
      const atTop = sidebar.scrollTop === 0;
      const atBottom =
        sidebar.scrollTop + sidebar.clientHeight >= sidebar.scrollHeight;

      if ((atTop && event.deltaY < 0) || (atBottom && event.deltaY > 0)) {
        event.preventDefault();
      }
    };

    const handleTouchStart = (event) => {
      startY = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
      const currentY = event.touches[0].clientY;
      const isScrollingDown = currentY < startY;
      const isScrollingUp = currentY > startY;

      const atTop = sidebar.scrollTop === 0;
      const atBottom =
        sidebar.scrollTop + sidebar.clientHeight >= sidebar.scrollHeight;

      if ((atTop && isScrollingUp) || (atBottom && isScrollingDown)) {
        event.preventDefault();
      }
    };

    window.addEventListener("resize", handleResize);
    sidebar.addEventListener("mouseenter", handleMouseEnter);
    sidebar.addEventListener("mouseleave", handleMouseLeave);

    sidebar.addEventListener("wheel", handleWheel, { passive: false });
    sidebar.addEventListener("touchstart", handleTouchStart, { passive: true });
    sidebar.addEventListener("touchmove", handleTouchMove, { passive: false });

    onDestroy(() => {
      sidebar.removeEventListener("wheel", handleWheel);
      sidebar.removeEventListener("touchstart", handleTouchStart);
      sidebar.removeEventListener("touchmove", handleTouchMove);
    });

    handleResize();
    updateSidebarClass();

    return () => {
      window.removeEventListener("resize", handleResize);
      sidebar.removeEventListener("mouseenter", handleMouseEnter);
      sidebar.removeEventListener("mouseleave", handleMouseLeave);
    };
  });

  let isLoading = false;
  let stopRequest = false;

  function handleAnimationIteration() {
    if (stopRequest) {
      stopRequest = false;
      isLoading = false;
    }
  }

  let modalOpen = false;

  function openModal() {
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
  }

  let userModalOpen = false;
  let userModalSize = "45vw";

  function openUserModal(modalSize) {
    userModalSize = modalSize;
    console.log("velikost " + userModalSize);
    userModalOpen = true;
  }

  function closeUserModal() {
    userModalOpen = false;
  }

  let isSubmenuOpen = false;

  function toggleMenu(event) {
    event.preventDefault();
    isSubmenuOpen = !isSubmenuOpen;
  }

  function handleClickOutside() {
    if (isMobile && !sidebar.classList.contains("collapsed")) {
      toggleSidebar();
    }
  }
</script>

<div class="layout-wrapper">
  <div class="header">
    <div class="pure-g">
      <div class="pure-u-1-2">
        <div class="header-left">
          <button class="hamburger-btn" on:click={toggleSidebar}>
            <i class="fas fa-bars"></i>
          </button>
          <a href="#" class="pure-menu-heading">
            <span>Dokumenty</span>
          </a>
        </div>
      </div>
      <div class="pure-u-1-2">
        <div class="header-right">
          {#if isMobile}
            <button class="icon-btn" on:click={() => openUserModal("45vw")}>
              <i class="fas fa-user"></i>
            </button>
          {:else}
            <a
              href="#"
              class="pure-menu-link"
              on:click={() => openUserModal("30vw")}>email@email.com</a
            >
          {/if}
        </div>
      </div>
    </div>
  </div>

  <SidebarModal
    bind:shown={userModalOpen}
    orientation="right"
    on:close={closeUserModal}
    targetSize={userModalSize}
  >
    <a href="#" class="pure-menu-heading">
      <span>Petr Novák</span>
    </a>
    <a href="#" class="pure-menu-link" style="padding-left: 5px;"
      >email@email.com</a
    >
  </SidebarModal>

  <div class="content-wrapper">
    <div class="row">
      {#if isSidebarOverlay}
        <div class="overlay-bg" on:click={handleClickOutside}></div>
      {/if}
      <div class="sidebar" id="sidebar" bind:this={sidebar}>
        <div class="pure-menu pure-menu-vertical">
          <ul class="pure-menu-list">
            <li class="pure-menu-item first-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-dashboard"></i>
                <span>Nástěnka</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-file"></i>
                <span>Dokumenty</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-layer-group"></i>
                <span>Zařazení</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-list"></i>
                <span>Umístění</span>
              </a>
            </li>

            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link" on:click={toggleMenu}>
                <i class="fas fa-cogs"></i>
                <span>Administrace</span>
                {#if !isSidebarHidden}
                  <i
                    class="fas fa-chevron-down arrow-icon {isSubmenuOpen
                      ? 'rotated'
                      : ''}"
                  ></i>
                {/if}
              </a>
            </li>

            {#if !isSidebarHidden}
              <ul class="submenu {isSubmenuOpen ? 'submenu-open' : ''}">
                <li class="pure-menu-item">
                  <a href="#" class="pure-menu-link">
                    <i class="fas fa-layer-group"></i>
                    <span>Test 1</span>
                  </a>
                </li>
                <li class="pure-menu-item">
                  <a href="#" class="pure-menu-link">
                    <i class="fas fa-layer-group"></i>
                    <span>Test 2</span>
                  </a>
                </li>
              </ul>
            {/if}

            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-users-viewfinder"></i>
                <span>Objekty</span>
              </a>
            </li>

            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-file"></i>
                <span>Dokumenty</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-layer-group"></i>
                <span>Zařazení</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-list"></i>
                <span>Umístění</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-file"></i>
                <span>Dokumenty</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-layer-group"></i>
                <span>Zařazení</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-list"></i>
                <span>Umístění</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-file"></i>
                <span>Dokumenty</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-layer-group"></i>
                <span>Zařazení</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-list"></i>
                <span>Umístění</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-file"></i>
                <span>Dokumenty</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-layer-group"></i>
                <span>Zařazení</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-list"></i>
                <span>Umístění</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-file"></i>
                <span>Dokumenty</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-layer-group"></i>
                <span>Zařazení</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-list"></i>
                <span>Umístění</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-file"></i>
                <span>Dokumenty</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-layer-group"></i>
                <span>Zařazení</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-list"></i>
                <span>Umístění</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-file"></i>
                <span>Dokumenty</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-layer-group"></i>
                <span>Zařazení</span>
              </a>
            </li>
            <li class="pure-menu-item">
              <a href="#" class="pure-menu-link">
                <i class="fas fa-list"></i>
                <span>Umístění</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="main"
        id="main"
        on:click={handleClickOutside}
        style="width:100%;"
      >
        <div class="main-content" style="width:100%;">
          <div
            class="loader-line {isLoading ? 'active infinite' : ''}"
            id="loaderLine"
            on:animationiteration={handleAnimationIteration}
          ></div>

          <SidebarModal
            bind:shown={modalOpen}
            orientation="right"
            on:close={closeModal}
          >
            <p>test</p>
          </SidebarModal>

          <div class="pure-g card">
            <div class="pure-u-1-2 title-container">
              <h3 class="card-title">Hoooooooodne Dlouhy Nazev</h3>
            </div>

            <div class="pure-u-1-2 button-group">
              
              <button class="pure-button btn-primary icon-button">
                <i class="fas fa-file-import fa-fw"></i>
              </button>
              <button class="pure-button btn-info" >
                <i class="fa fa-refresh fa-fw"></i> Obnovit
              </button>

              <button class="pure-button btn-success important-button">
                <i class="fa fa-save fa-fw"></i> Uložit
              </button>
            </div>


          </div>
        </div>
        <div class="footer" id="footer">
          <div class="footer-content">Všechna práva vyhrazena.</div>
        </div>
      </div>
    </div>
  </div>
</div>
