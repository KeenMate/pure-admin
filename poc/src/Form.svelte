<script>
  import { onMount, onDestroy } from "svelte";
  import SidebarModal from "./lib/SidebarModal.svelte";

  import Select from "svelte-select";

  let isSidebarCollapsed = window.innerWidth < 1400;
  let isMobile = window.innerWidth < 800;
  let isSidebarHidden = isSidebarCollapsed;
  let isSidebarOverlay = false;

  let sidebar;
  let startY;

  let hasUserToggledSidebar = false;

  function toggleSidebar() {
    hasUserToggledSidebar = true;
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
  }

  onMount(() => {
    const sidebar = document.getElementById("sidebar");
    updateSidebarClass();

    const handleResize = () => {
      console.log("RESIZE PRED" + hasUserToggledSidebar + isSidebarCollapsed);

      isMobile = window.innerWidth < 800;

      if (isMobile) hasUserToggledSidebar = false;

      if (!hasUserToggledSidebar) isSidebarCollapsed = window.innerWidth < 1400;

      console.log("RESIZE PO" + hasUserToggledSidebar + isSidebarCollapsed);

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

  let options = [
    { label: "Option1", value: 1 },
    { label: "Option2", value: 2 },
    { label: "Option3", value: 3 },
  ];
  let selectedOption = options[0];
</script>

<div class="layout-wrapper">
  <div class="header">
    <div class="pure-g">
      <div class="pure-u-1-2">
        <div class="header-left">
          <button
            class="hamburger-btn"
            on:click={toggleSidebar}
            aria-label="hamburger"
          >
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

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
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
              <h3 class="card-title">Novy dokument</h3>
            </div>

            <div class="pure-u-1-2 button-group">
              <button class="pure-button btn-primary icon-button">
                <i class="fas fa-file-import fa-fw"></i>
              </button>
              <button class="pure-button btn-info">
                <i class="fa fa-refresh fa-fw"></i>
                <span class="btn-text">Obnovit</span>
              </button>

              <button class="pure-button btn-success important-button">
                <i class="fa fa-save fa-fw"></i>
                <span class="btn-text">Uložit</span>
              </button>
            </div>
          </div>

          <div class="pure-g">
            <div class="cardRow">
              <div class="card">
                <div class="pure-u-1 card-header">Vlastnosti dokumentu</div>

                <div class="pure-u-1">
                  <div class="pure-g pure-form pure-form-stacked g-space">
                    <div class="pure-u-2-3">
                      <label for="viditlnyNazev"
                        >Viditelny nazev pro uzivatele</label
                      >
                      <input
                        id="viditlnyNazev"
                        type="text"
                        class="pure-input-1"
                      />

                      <label for="tooltip">Tooltip</label>
                      <input id="tooltip" type="text" class="pure-input-1" />

                      <label for="priorita">Priorita</label>
                      <div class="pure-g">
                        <div class="pure-u-1-8">
                          <input
                            id="priorita"
                            type="number"
                            class="pure-input-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="pure-u-1-3">
                      <div class="formElementGap">
                        <label for="klicovaSlova">Klicova slova</label>
                        <textarea
                          id="klicovaSlova"
                          class="pure-input-1"
                          placeholder="Klicova slova pro tento dokument"
                          rows="9"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="pure-g pure-form g-space">
                    <div class="pure-u-1-4">
                      <label for="publikovatOd">Publikovat od</label>
                      <input
                        type="date"
                        id="publikovatOd"
                        class="pure-input-1"
                      />
                    </div>
                    <div class="pure-u-1-4">
                      <div class="formElementGap">
                        <label for="publikovatDo">Publikovat do</label>
                        <input
                          type="date"
                          id="publikovatDo"
                          class="pure-input-1"
                        />
                      </div>
                    </div>

                    <div class="pure-u-1-4">
                      <div class="formElementGap">
                        <label for="ucinnostOd">Ucinnost od</label>
                        <input
                          type="date"
                          id="ucinnostOd"
                          class="pure-input-1"
                        />
                      </div>
                    </div>
                    <div class="pure-u-1-4">
                      <div class="formElementGap">
                        <label for="ucinnostDo">Ucinnost do</label>
                        <input
                          type="date"
                          id="ucinnostDo"
                          class="pure-input-1"
                        />
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div class="pure-g pure-form">
                    <div class="pure-u-1-4 pure-form-stacked">
                      <label class="switch-label">
                        <label class="switch">
                          <input type="checkbox" checked />
                          <span class="slider"></span>
                        </label>
                        <span class="switch-text">Novinka</span>
                      </label>

                      <label class="switch-label">
                        <label class="switch">
                          <input type="checkbox" />
                          <span class="slider"></span>
                        </label>
                        <span class="switch-text">Aktualizace</span>
                      </label>
                    </div>

                    <div class="pure-u-1-4">
                      <div class="formElementGap">
                        <input type="date" class="pure-input-1" />
                      </div>
                    </div>

                    <div class="pure-u-1-4">
                      <div class="formElementGap">
                        <input type="date" class="pure-input-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="pure-u-1 card-header">Umisteni a zarazeni</div>
                <div class="pure-g pure-u-1">
                  <Select
                    placeholder="Vyberte umisteni"
                    bind:value={selectedOption}
                    items={options}
                    class="svelte-select"
                  ></Select>
                </div>

                <hr />

                <div class="pure-g"></div>
              </div>
            </div>
          </div>

          <div class="pure-g">
            <div class="pure-u-2-3">
              <div class="cardRow oneHalf">
                <div class="card">
                  <label class="switch-label">
                    <label class="switch">
                      <input type="checkbox" checked />
                      <span class="slider"></span>
                    </label>
                    <span class="switch-text">Pro všechny</span>
                  </label>
                </div>

                <div class="card">
                  <div class="pure-u-1">
                    <div class="pure-form pure-form-stacked">
                      <label class="switch-label">
                        <span class="switch-text">Soubor</span>
                        <label class="switch">
                          <input type="checkbox" checked />
                          <span class="slider"></span>
                        </label>
                        <span class="switch-text">Odkaz</span>
                      </label>
                      <hr />
                      <div
                        class="input-icon-wrapper input-icon-wrapper pure-u-1"
                      >
                        <input
                          type="text"
                          class="pure-input input-with-icon"
                          placeholder="Nahrát nový soubor"
                        />

                        <div class="input-icon-container">
                          <i class="input-icon fas fa-upload"></i>
                        </div>
                      </div>
                      <label for="nazevSouboru"
                        >Nazev souboru pri stazeni</label
                      >
                      <input
                        id="nazevSouboru"
                        type="text"
                        class="pure-input-1"
                      />
                      <label>Velikost souboru: 0kb</label>
                    </div>
                  </div>
                </div>
              </div>
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

<style>
  @import url("https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

  :root {
    font-size: 16px;
    font-family: "Fira Sans Condensed";
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    font-size: 1em;
  }

  .layout-wrapper {
    min-height: 100vh;
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2.5em;
    /* z-index: 1001; */
    background: white;
    border-bottom: 1px solid #ccc;
  }

  .header .pure-menu {
    height: 100%;
  }

  .header .pure-g {
    height: 100%;
    align-items: center;
  }

  .hamburger-btn {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    padding: 0 0.5em 0 0.5em;
    margin-right: 0;
  }

  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 1em 0 0.5em;
    font-size: 1.45em;
  }

  .sticky-hamburger {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.5);
    border-radius: 0.25em;
    padding: 0.5em;
    margin: 0;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;

    display: none;
  }

  .btn-left {
    left: 0;
  }

  .btn-right {
    right: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
  }

  .header-right .pure-menu-link {
    padding-right: 1em;
  }

  img {
    margin-right: 1em;
  }

  .content-wrapper {
    min-height: calc(100vh - 2.5em);
    margin-top: 2.5em;
  }

  .sidebar {
    background-color: #700000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);

    width: 100%;
    min-width: auto;
    max-width: 250px;

    flex-shrink: 0;

    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    /* scrollbar-color: #b00000 white; */

    /* height: calc(100vh - 2.5em + 1px);
    min-height: calc(100vh - 2.5em + 1px); */
    height: calc(100vh - 2.5em);
    min-height: calc(100vh - 2.5em);

    position: sticky;
    /* top: calc(2.5em + 1px); */
    top: calc(2.5em);
  }

  .main {
    display: flex;
    min-width: 0;
  }

  :global(.sidebar.collapsed) {
    /* width: 3.75em;
    min-width: 3.75em; */
    width: 3em;
    min-width: 3em;

    overflow: hidden;

    top: calc(2.5em + 1px);
    height: calc(100vh - 2.5em - 1px);
    min-height: calc(100vh - 2.5em - 1px);
  }

  :global(.main.sidebar-collapsed) {
    margin-left: 0;
  }

  :global(.sidebar.hover-expanded) {
    position: fixed;
    /* top: calc(2.5em + 1px);
    height: calc(100vh - 2.5em + 1px); */
    top: calc(2.5em);
    height: calc(100vh - 2.5em);
    z-index: 1000;

    width: 250px;
    max-width: 250px;
  }

  :global(.sidebar.hover-expanded + .main) {
    margin-left: 3em;
  }

  .sidebar .pure-menu {
    background: transparent;
    /* overflow: hidden; */
  }

  .sidebar .pure-menu-link {
    color: white;
    display: flex;
    align-items: baseline;
    padding: 0.5em 1em 0.5em 0.75em !important;
    white-space: break-spaces;
    min-height: 2.5em;
    line-height: 1.2;
    box-sizing: border-box;
  }

  .sidebar .pure-menu-link span {
    word-break: break-word;
    overflow-wrap: break-word;
    display: block;
    max-width: 100%;
  }

  :global(.sidebar.collapsed .pure-menu-link span) {
    display: none;
  }

  .sidebar .pure-menu-link i {
    flex-shrink: 0;
    margin-right: 0.5em;
    width: 1.5em;
    text-align: center;
  }

  :global(.sidebar.collapsed .pure-menu-link i) {
    margin-right: 0;
  }

  .row {
    display: flex;
    flex-direction: row;
  }

  .first-item {
    margin-top: 0.5em;
  }

  .main-content {
    padding: 0.3em 0.5em 3em 0.5em;
    position: relative;
    max-width: 100%;
    box-sizing: border-box;
  }

  .main-content .pure-g {
    margin-bottom: 0.5em;
  }

  .footer {
    position: fixed;
    bottom: 0;
    height: 3em;
    background: white;
    border-top: 1px solid #ccc;
    margin-top: 0.5em;
    width: 100%;
  }

  .footer-content {
    padding: 0 1em;
    line-height: 3em;
  }

  .card {
    border: 1px solid #ccc;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 0.5em;
    border-radius: 0.2em;
    background-color: #fff;
    margin: 0 0 0.5em 0;

    display: flex;
    align-items: center;
    justify-content: space-between;
    /* flex: 1; */
    box-sizing: border-box;

    flex-wrap: wrap;
  }

  .cardRow {
    display: flex;
    gap: 1em;
    align-items: flex-start;
    width: 100%;
  }

  .button-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .card-title {
    margin-top: 0.5em !important;
    margin-bottom: 0.5em !important;
    word-break: break-word;
  }

  .title-container {
    flex: 1;
  }

  .twoThirds {
    flex: 2;
  }
  .oneThird {
    flex: 1;
  }

  .oneHalf > .card {
    flex: 1;
  }

  /* .important-button {
    order: 1;
  }

  @media (max-width: 500px) {
    .button-group {
      flex-direction: row;
    }

    .important-button {
      order: -1;
      margin-left: 0;
    }
  } */

  /* @media (max-width: 500px) {

    .card {
        flex-direction: column;
        align-items: flex-start;
    }

    .title-container {
        width: 100%;
    }

    .card-title {
        white-space: normal;
    }

    .button-group {
        width: 100%;
        margin-top: 10px;
    }
} */

  .card-header {
    margin: -0.5em -0.5em 0.5em -0.5em;
    padding: 0.5em;
    border-bottom: 1px solid #ccc;
    text-align: left;
  }

  .box {
    border: 1px solid #ccc;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1em;
    margin-right: min(0.5em, 2vw);

    max-width: 100%;
    word-wrap: break-word;
    white-space: normal;
  }

  .ripple {
    background-position: center;
    transition: background 0.5s;
  }

  .ripple:hover {
    background: radial-gradient(circle, transparent 1%, rgba(0, 0, 0, 0.3) 1%)
      center/15000%;
  }

  .ripple:active {
    background-size: 100%;
    transition: background 0s;
  }

  .loader-line {
    width: 100%;
    height: 3px;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    background-color: #ddd;
    -webkit-border-radius: 0;
    -moz-border-radius: 0;
    border-radius: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .loader-line.active {
    opacity: 1;
  }

  .loader-line:before {
    content: "";
    position: absolute;
    left: -50%;
    height: 3px;
    width: 40%;
    background-color: coral;
    -webkit-border-radius: 0;
    -moz-border-radius: 0;
    border-radius: 0;
  }

  .loader-line.active:before {
    -webkit-animation: lineAnim 1.5s linear;
    -moz-animation: lineAnim 1.5s linear;
    animation: lineAnim 1.5s linear;
  }

  .loader-line.infinite:before {
    -webkit-animation: lineAnim 1.5s linear infinite;
    -moz-animation: lineAnim 1.5s linear infinite;
    animation: lineAnim 1.5s linear infinite;
  }

  @keyframes lineAnim {
    0% {
      left: -40%;
    }

    50% {
      left: 20%;
      width: 80%;
    }

    100% {
      left: 100%;
      width: 100%;
    }
  }

  button {
    /* margin: 0 0.5rem 0 0.5rem; */
    margin: 0;
  }

  .button-container {
    display: flex;
    gap: 0.5em;

    flex-wrap: wrap;
    width: 100%;
    box-sizing: border-box;
  }

  .mixed-container {
    display: flex;
    gap: 0.5em;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
  }

  .mixed-container > * {
    flex: 0 1 auto;
    min-width: fit-content;
  }

  .svelte-select {
    flex: 0 1 12rem;
    padding: 0.5em;
    font-size: 1em;
  }

  .input-icon-wrapper {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 0.5em;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }

  .input-with-icon {
    padding-left: 2.5em !important;
    width: 100%;
  }

  .input-icon-container {
    position: absolute;
    /* left: 0; */
    top: 0;
    bottom: 0;
    width: auto;
    min-width: 2em;
    background-color: #e6e6e6;
    border: 1px solid #ccc;
    /* border-right: none; */
    /* border-radius: 4px 0 0 4px; */
    display: flex;
    align-items: center;
    justify-content: center;

    margin: 0.25em 0;
  }

  .input-icon-wrapper:not(.input-icon-wrapper--right) .input-icon-container {
    left: 0;
    border-right: none;
    border-radius: 4px 0 0 4px;
  }

  .input-icon-wrapper:not(.input-icon-wrapper--right) .input-with-icon {
    padding-left: 3em !important;
  }

  .input-icon-wrapper--right .input-icon-container {
    right: 0;
    border-left: none;
    border-radius: 0 4px 4px 0;
  }

  .input-icon-wrapper--right .input-with-icon {
    padding-right: 5em !important;
  }

  .pure-menu-heading {
    display: flex;
    align-items: center;
    padding-left: 0.65em;
  }

  .pure-menu-heading span {
    font-size: 1.3em;
  }

  .icheck-primary input[type="checkbox"] {
    cursor: default !important;
  }

  label {
    display: inline-block;
    max-width: 100%;
    font-weight: 700;
    font-size: 14px;
    color: #333;
  }

  .icheck-primary {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icheck-primary input[type="checkbox"] {
    width: 18px;
    height: 18px;
    border: 2px solid #007bff;
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    position: relative;
  }

  .icheck-primary input[type="checkbox"]:checked {
    background-color: #007bff;
    border-color: #007bff;
  }

  .icheck-primary input[type="checkbox"]:checked:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .icheck-primary input[type="checkbox"]:focus {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  .icheck-primary label {
    cursor: pointer;
  }

  .svelte-select {
    margin-left: 1em !important;
    margin-right: 1em !important;
  }

  table {
    border: 1px solid #ccc;
    border-collapse: collapse;
    margin: 0;
    padding: 0;
    width: 100%;
    table-layout: fixed;
  }

  table caption {
    font-size: 1.5em;
    margin: 0.5em 0 0.75em;
  }

  table tr {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    padding: 0.35em;
  }

  table th,
  table td {
    padding: 0.625em;
    text-align: center;
  }

  table th {
    font-size: 0.85em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  :global(.sidebar.hover-expanded ~ .main) {
    margin-left: 3em;
  }

  @media screen and (max-width: 800px) {
    :root {
      font-size: 18px;
    }

    table {
      border: 0;
    }

    table caption {
      font-size: 1.3em;
    }

    table thead {
      border: none;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
    }

    table tr {
      border-bottom: 3px solid #ddd;
      display: block;
      margin-bottom: 0.625em;
    }

    table td {
      border-bottom: 1px solid #ddd;
      display: block;
      font-size: 0.8em;
      text-align: right;
    }

    table td::before {
      content: attr(data-label);
      float: left;
      font-weight: bold;
      text-transform: uppercase;
    }

    table td:last-child {
      border-bottom: 0;
    }

    :global(.sidebar.collapsed) {
      width: 0;
      min-width: 0;
    }

    :global(.sidebar.overlay) {
      position: fixed;
      height: calc(100vh - 2.5em);
      min-height: calc(100vh - 2.5em);
      z-index: 1003;
      top: 2.5em;

      width: 90vw;
      min-width: 90vw;
    }

    .overlay-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.25);
      z-index: 1002;
      display: block;
    }

    :global(.sidebar.overlay .pure-menu-link span) {
      word-break: break-word;
      overflow-wrap: break-word;
      display: block;
      max-width: 100%;
    }

    .right-sidebar {
      background-color: #700000;
      box-shadow: -4px 0 6px rgba(0, 0, 0, 0.25);

      width: 90vw;
      height: 50vh;

      position: fixed;
      right: -90vw;
      bottom: 0;

      overflow-y: auto;
      overflow-x: hidden;

      z-index: 1000;

      justify-content: flex-end;
    }

    :global(.right-sidebar.overlay) {
      right: 0;
    }

    :global(.right-sidebar .pure-menu-link) {
      color: white;
      display: flex;
      align-items: baseline;
      padding: 0.5em 1em 0.5em 1em !important;
      white-space: break-spaces;
      min-height: 2.5em;
      line-height: 1.2;
      box-sizing: border-box;

      justify-content: flex-end;

      margin-right: 50px;
    }

    .right-sidebar .pure-menu-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .right-sidebar .pure-menu-link span {
      word-break: break-word;
      overflow-wrap: break-word;
      display: block;
      max-width: 100%;
    }

    .right-sidebar .pure-menu-link i {
      flex-shrink: 0;
      margin-right: 0.5em;
      width: 1.5em;
      text-align: center;
    }

    .right-sidebar .pure-menu {
      align-items: flex-end;
    }

    .right-sidebar .pure-menu-item {
      width: 100%;
      text-align: right;
    }

    .sticky-hamburger {
      display: block;
    }

    .pure-menu-list {
      padding-bottom: 6em !important;
    }

    .btn-text {
      display: none;
    }
  }

  /* .sidebar.collapsed .pure-menu-link {
    display: block;
} */

  .centered-container {
    display: flex;
    align-items: center;
  }

  /* .pure-form {
    display: flex !important;
    align-items: center !important;
} */

  .pure-menu-children {
    display: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding-left: 1em;
  }

  .pure-menu-active > .pure-menu-children {
    display: block;
    width: 6em;
  }

  .pure-menu-item {
    position: relative;
  }

  .pure-menu-children .pure-menu-link {
    color: black;
  }

  .sidebar .pure-menu-link {
    background-color: transparent;
  }

  .sidebar .pure-menu-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .pure-menu-active > .pure-menu-children .pure-menu-link:hover {
    background-color: #f8f8f8;
  }

  .arrow-icon {
    transition: transform 0.3s ease;
    margin: 0 0 0 0.5em !important;
  }

  .rotated {
    transform: rotate(180deg);
  }

  .submenu {
    transition:
      max-height 0.2s ease,
      opacity 0.2s ease;
    padding-left: 1em;
    display: none;
  }

  .submenu-open {
    display: block;
  }

  .btn-primary {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0d6efd;
  }

  .btn-primary:active {
    background-color: #0b5ed7;
  }

  .btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #6c757d;
  }

  .btn-secondary:active {
    background-color: #5c636a;
  }

  .btn-success {
    background-color: #198754;
    border-color: #198754;
    color: white;
  }

  .btn-success:hover {
    background-color: #198754;
  }

  .btn-success:active {
    background-color: #157347;
  }

  .btn-danger {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background-color: #dc3545;
  }

  .btn-danger:active {
    background-color: #bb2d3b;
  }

  .btn-warning {
    background-color: #ffc107;
    border-color: #ffc107;
    color: black;
  }

  .btn-warning:hover {
    background-color: #ffc107;
  }

  .btn-warning:active {
    background-color: #ffca2c;
  }

  .btn-info {
    background-color: #17a2b8;
    border-color: #17a2b8;
    color: white;
  }

  .btn-info:hover {
    background-color: #0dcaf0;
  }

  .btn-info:active {
    background-color: #31d2f2;
  }

  .btn-light {
    background-color: #f8f9fa;
    border-color: #f8f9fa;
    color: black;
  }

  .btn-light:hover {
    background-color: #f8f9fa;
  }

  .btn-light:active {
    background-color: #e2e6ea;
  }

  .btn-dark {
    background-color: #212529;
    border-color: #212529;
    color: white;
  }

  .btn-dark:hover {
    background-color: #212529;
  }

  .btn-dark:active {
    background-color: #1c1f23;
  }

  .pure-button {
    padding: 0.5em 0.5em;
  }

  .font-size-display {
    width: 2.5em;
  }

  input[type="range"] {
    width: 100%;
    max-width: 15em;
  }

  input.hidden-calendar::-webkit-inner-spin-button,
  input.hidden-calendar::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
  }

  .pure-form input {
    box-shadow: none !important;
  }

  .pure-form textarea {
    box-shadow: none !important;
    resize: vertical;
  }

  .formElementGap {
    padding-left: 1em;
  }

  .g-space {
    margin-bottom: 1em !important;
  }

  hr {
    border: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .switch-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  }

  /* The switch track */
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 25px;
  }

  /* Hide default checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 5px;
  }

  /* The knob */
  .slider:before {
    position: absolute;
    content: "";
    height: 21px;
    width: 21px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 25%;
  }

  /* Checked state */
  input:checked + .slider {
    background-color: #2196f3;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
  }

  input:checked + .slider:before {
    transform: translateX(25px);
  }

  .svelte-select {
    margin-left: 0 !important;
  }

  .gapMarginThird {
    margin-left: 1em;
    width: calc(33.33% - 1em);
  }

  /* .gapMarginHalf{y
    margin-left: 1em;
    width:calc(50% - 1em)
  } */
  .gapMargin {
    margin-left: 1em;
  }
</style>
