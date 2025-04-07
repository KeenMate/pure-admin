<script>
  import toastr from "toastr";
  import Select from "svelte-select";
  import { onMount, onDestroy } from "svelte";
  import SidebarModal from "./lib/SidebarModal.svelte";

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
      isMobile = window.innerWidth < 800;

      if (isMobile) hasUserToggledSidebar = false;

      if (!hasUserToggledSidebar) isSidebarCollapsed = window.innerWidth < 1400;

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

  function toggleLoading() {
    if (!isLoading) {
      isLoading = true;
    } else {
      stopRequest = true;
    }
  }

  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-bottom-right",
    timeOut: "3000",
  };

  function showToast() {
    toastr.success("Connection established.");
  }

  let options = [
    { label: "Option1", value: 1 },
    { label: "Option2", value: 2 },
    { label: "Option3", value: 3 },
  ];
  let selectedOption = options[0];

  let modalOpen = false;

  function openModal() {
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
  }

  let userModalOpen = false;
  let userModalSize = "33vw";

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

  let selectedFontSize = 16;
  let appliedFontSize = 16;

  function applyFontSize() {
    appliedFontSize = selectedFontSize;
    document.documentElement.style.fontSize = `${appliedFontSize}px`;
  }

  let dateInput;
  let dateInput2;

  function openDatePicker() {
    if (dateInput) {
      dateInput.showPicker();
    }
    if (dateInput2) {
      dateInput2.showPicker();
    }
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

    <div class="modalContentContainer">
    
      <div style="display: flex; justify-content: flex-end;">
        <button 
          on:click={closeUserModal} 
          class="modalCloseButton"
        >
          &times;
        </button>
      </div>
  
      <h1 class="modalTitle">Petr Novak (IT Services)</h1>
  
      <div class="modalInfoContainer">
        <div class="modalInfoRow">
          <div><strong>Username:</strong></div>
          <div>Petr Novák</div>
        </div>
        <div class="modalInfoRow">
          <div><strong>Email:</strong></div>
          <div>email@email.com</div>
        </div>
      </div>
  
    </div>
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

      <div class="main" id="main" on:click={handleClickOutside}>
        <div class="main-content">
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
            <p>test testtesttest test</p>
          </SidebarModal>

          <div class="pure-g card">
            <div class="pure-u-1-2">
              <a
                href="/#/test"
                class="pure-menu-link"
                style="display: inline-block;">Test</a
              >
              <a
                href="/#/form"
                class="pure-menu-link"
                style="display: inline-block;">Form</a
              >
            </div>

            <div class="pure-u-1-2" style="text-align: right;">
              <button class="pure-button btn-primary ripple">Obnovit</button>
            </div>
          </div>

          <div class="pure-g card">
            <div class="pure-u-1 card-header">Button colors</div>
            <div class="button-container centered-container">
              <button class="pure-button btn-primary ripple">Primary</button>
              <button class="pure-button btn-secondary ripple">Secondary</button
              >
              <button class="pure-button btn-success ripple">Success</button>
              <button class="pure-button btn-danger ripple">Danger</button>
              <button class="pure-button btn-warning ripple">Warning</button>
              <button class="pure-button btn-info ripple">Info</button>
              <button class="pure-button btn-light ripple">Light</button>
              <button class="pure-button btn-dark ripple">Dark</button>
            </div>
          </div>

          <div class="pure-g card">
            <div class="pure-u-1 card-header">Change font size</div>
            <div class="mixed-container">
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                bind:value={selectedFontSize}
              />
              <span class="font-size-display">{selectedFontSize}px</span>
              <button
                class="pure-button btn-primary ripple"
                on:click={applyFontSize}
              >
                Apply
              </button>
            </div>
          </div>

          <div class="pure-g card">
            <div class="pure-u-1 card-header">Date picker</div>
            <div class="pure-form centered-container mixed-container">
              <div class="input-icon-wrapper">
                <div class="input-icon-container" on:click={openDatePicker}>
                  <i class="input-icon fas fa-calendar-alt"></i>
                </div>
                <input
                  type="date"
                  bind:this={dateInput}
                  class="pure-input input-with-icon hidden-calendar"
                />
              </div>

              <input type="date" bind:this={dateInput2} class="pure-input" />
            </div>
          </div>

          <div class="pure-g card">
            <div class="pure-u-1-3 pure-u-lg-1-4 pure-u-xl-1-8">
              <div class="box">Počet dokumentů</div>
            </div>
            <div class="pure-u-1-3 pure-u-lg-1-4 pure-u-xl-1-8">
              <div class="box">Počet obrazců</div>
            </div>
            <div class="pure-u-1-3 pure-u-lg-1-4 pure-u-xl-1-8">
              <div class="box">Počet velkolepych panu</div>
            </div>
          </div>

          <div class="pure-g card">
            <table>
              <caption>Statement Summary</caption>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Visa - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Amount">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">Visa - 6076</td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Amount">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">Corporate AMEX</td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Amount">$1,181</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Acount">Visa - 3412</td>
                  <td data-label="Due Date">02/01/2016</td>
                  <td data-label="Amount">$842</td>
                  <td data-label="Period">01/01/2016 - 01/31/2016</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pure-g card">
            <div class="pure-u-1-2">
              <table class="pure-table pure-table-horizontal">
                <thead>
                  <tr>
                    <th>Katalog</th>
                    <th>Kód</th>
                    <th>Název</th>
                    <th>Počet stažení</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Správa ŽP</td>
                    <td>AAAAA</td>
                    <td>Připomínky a návrhy na změnu rozcestníku</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Správa ŽP</td>
                    <td>AAAAA</td>
                    <td>Připomínky a návrhy na změnu rozcestníku</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Správa ŽP</td>
                    <td>AAAAA</td>
                    <td>Připomínky a návrhy na změnu rozcestníku</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Správa ŽP</td>
                    <td>AAAAA</td>
                    <td>Připomínky a návrhy na změnu rozcestníku</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Správa ŽP</td>
                    <td>AAAAA</td>
                    <td>Připomínky a návrhy na změnu rozcestníku</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Správa ŽP</td>
                    <td>AAAAA</td>
                    <td>Připomínky a návrhy na změnu rozcestníku</td>
                    <td>4</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pure-u-1-2">
              <table class="pure-table pure-table-horizontal">
                <thead>
                  <tr>
                    <th>Katalog</th>
                    <th>Kód</th>
                    <th>Název</th>
                    <th>Počet stažení</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Správa ŽP</td>
                    <td>AAAAA</td>
                    <td>Připomínky a návrhy na změnu rozcestníku</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Správa ŽP</td>
                    <td>AAAAA</td>
                    <td>Připomínky a návrhy na změnu rozcestníku</td>
                    <td>4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="pure-g card">
            <div class="pure-u-1 card-header">Button experiments</div>
            <div class="pure-form centered-container">
              <div class="input-icon-wrapper">
                <div class="input-icon-container">
                  <i class="input-icon fas fa-envelope"></i>
                </div>
                <input
                  type="email"
                  class="pure-input input-with-icon"
                  placeholder="Email"
                />
              </div>
            </div>
            <div class="centered-container mixed-container">
              <button class="pure-button btn-primary ripple">Ripple</button>
              <button
                class="pure-button loading-button btn-primary ripple"
                id="loadingButton"
                on:click={toggleLoading}>Loading</button
              >
              <button
                class="pure-button btn-primary ripple"
                id="show-toast"
                on:click={showToast}>Toastr</button
              >

              <div class="icheck-primary centered-container">
                <input type="checkbox" id="someCheckboxId" />
                <label for="someCheckboxId">i-check</label>
              </div>

              <Select
                bind:value={selectedOption}
                items={options}
                placeholder="Select"
                class="svelte-select"
              ></Select>

              <button
                class="pure-button btn-primary ripple"
                on:click={openModal}>Modal</button
              >
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
