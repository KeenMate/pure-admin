/**
 * Pure Admin - File Selector Component
 * Handles file input styling, drag & drop, previews, and upload progress
 */

(function() {
  'use strict';

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Format bytes to human-readable size
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file type from extension
   */
  function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      // Images
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image',
      // Documents
      pdf: 'pdf', doc: 'doc', docx: 'docx', txt: 'txt',
      // Spreadsheets
      xls: 'xls', xlsx: 'xlsx', csv: 'xls',
      // Archives
      zip: 'zip', rar: 'rar', '7z': 'zip', tar: 'zip', gz: 'zip',
      // Media
      mp4: 'video', avi: 'video', mov: 'video', wmv: 'video',
      mp3: 'audio', wav: 'audio', flac: 'audio', ogg: 'audio'
    };
    return types[ext] || 'default';
  }

  /**
   * Get file icon class based on type
   */
  function getFileIconClass(filename) {
    const type = getFileType(filename);
    return `pa-file-icon pa-file-icon--${type}`;
  }

  /**
   * Check if file is an image
   */
  function isImageFile(file) {
    return file.type.startsWith('image/');
  }

  /**
   * Create file preview URL using FileReader
   */
  function createImagePreview(file, callback) {
    if (!isImageFile(file)) {
      callback(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.onerror = () => callback(null);
    reader.readAsDataURL(file);
  }

  // ============================================================================
  // Section 1 & 2: Basic File Input (Single & Multiple)
  // ============================================================================

  function initBasicFileInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const button = input.nextElementSibling;
    const filenameDisplay = button.nextElementSibling;

    button.addEventListener('click', () => input.click());

    input.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files.length === 0) {
        filenameDisplay.textContent = 'No file chosen';
      } else if (files.length === 1) {
        filenameDisplay.textContent = files[0].name;
      } else {
        filenameDisplay.textContent = `${files.length} files selected`;
      }
    });
  }

  // ============================================================================
  // Section 3 & 4: Drag & Drop Zones
  // ============================================================================

  function initDropzone(dropzoneId, listId = null) {
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone) return;

    const input = dropzone.querySelector('.pa-file-dropzone__input');
    const listContainer = listId ? document.getElementById(listId) : null;
    const filesInside = dropzone.dataset.filesInside === 'true';
    let selectedFiles = [];

    // Click to browse
    dropzone.addEventListener('click', (e) => {
      if (e.target === input) return; // Prevent double-trigger when clicking invisible input
      if (e.target.classList.contains('pa-file-item__remove')) return;
      if (e.target.classList.contains('pa-file-dropzone__file-card-remove')) return;
      input.click();
    });

    // Drag events
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('pa-file-dropzone--active');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (e.target === dropzone) {
        dropzone.classList.remove('pa-file-dropzone--active');
      }
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('pa-file-dropzone--active');

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    });

    // Input change
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    });

    function handleFiles(files) {
      if (!input.multiple) {
        selectedFiles = files.slice(0, 1);
      } else {
        selectedFiles = [...selectedFiles, ...files];
      }

      // Render based on mode
      if (filesInside) {
        renderFilesInside(selectedFiles);
      } else if (!input.multiple && !listContainer && selectedFiles.length > 0) {
        showSelectedFileInDropzone(selectedFiles[0]);
      } else if (listContainer) {
        renderFileList(selectedFiles, listContainer);
      }
    }

    function showSelectedFileInDropzone(file) {
      const content = dropzone.querySelector('.pa-file-dropzone__content');
      content.innerHTML = `
        <div class="pa-file-dropzone__icon">✓</div>
        <div class="pa-file-dropzone__text">
          <strong>${escapeHtml(file.name)}</strong>
        </div>
        <div class="pa-file-dropzone__hint">
          ${formatFileSize(file.size)} • Click to change
        </div>
      `;
    }

    function renderFilesInside(files) {
      // Remove existing content
      const existingContent = dropzone.querySelector('.pa-file-dropzone__content');
      const existingPrompt = dropzone.querySelector('.pa-file-dropzone__drop-prompt');
      const existingGrid = dropzone.querySelector('.pa-file-dropzone__files-grid');

      if (existingContent) existingContent.remove();

      // Create or update drop prompt
      if (!existingPrompt) {
        const prompt = document.createElement('div');
        prompt.className = 'pa-file-dropzone__drop-prompt';
        prompt.innerHTML = '<span class="pa-file-dropzone__drop-prompt-icon">📎</span> Drop files here or click to browse';
        dropzone.insertBefore(prompt, dropzone.firstChild);
      }

      // Create or get files grid
      let filesGrid = existingGrid;
      if (!filesGrid) {
        filesGrid = document.createElement('div');
        filesGrid.className = 'pa-file-dropzone__files-grid';
        dropzone.appendChild(filesGrid);
      }

      // Render files
      if (files.length === 0) {
        filesGrid.innerHTML = '';
        return;
      }

      filesGrid.innerHTML = files.map((file, index) => `
        <div class="pa-file-dropzone__file-card">
          <div class="pa-file-dropzone__file-card-icon">${getFileIconEmoji(file.name)}</div>
          <div class="pa-file-dropzone__file-card-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
          <div class="pa-file-dropzone__file-card-size">${formatFileSize(file.size)}</div>
          <button type="button" class="pa-file-dropzone__file-card-remove" data-index="${index}"></button>
        </div>
      `).join('');

      // Attach remove handlers
      filesGrid.querySelectorAll('.pa-file-dropzone__file-card-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          selectedFiles.splice(index, 1);
          renderFilesInside(selectedFiles);
        });
      });
    }

    function getFileIconEmoji(filename) {
      const type = getFileType(filename);
      const icons = {
        pdf: '📄',
        doc: '📝', docx: '📝',
        xls: '📊', xlsx: '📊',
        zip: '🗜️', rar: '🗜️',
        image: '🖼️',
        video: '🎬',
        audio: '🎵',
        txt: '📃',
        default: '📁'
      };
      return icons[type] || icons.default;
    }

    function renderFileList(files, container) {
      if (files.length === 0) {
        container.innerHTML = '';
        return;
      }

      container.innerHTML = files.map((file, index) => `
        <div class="pa-file-item">
          <div class="${getFileIconClass(file.name)}"></div>
          <div class="pa-file-info">
            <div class="pa-file-item__name">${escapeHtml(file.name)}</div>
            <div class="pa-file-item__meta">${formatFileSize(file.size)}</div>
          </div>
          <button type="button" class="pa-file-item__remove" data-index="${index}"></button>
        </div>
      `).join('');

      // Attach remove handlers
      container.querySelectorAll('.pa-file-item__remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          selectedFiles.splice(index, 1);
          renderFileList(selectedFiles, container);
        });
      });
    }
  }

  // ============================================================================
  // Section 5: Image Preview with Thumbnails
  // ============================================================================

  function initImagePreview(dropzoneId, previewContainerId) {
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone) return;

    const input = dropzone.querySelector('.pa-file-dropzone__input');
    const previewContainer = document.getElementById(previewContainerId);
    const filesInside = dropzone.dataset.filesInside === 'true';
    let selectedFiles = [];

    // Click to browse
    dropzone.addEventListener('click', (e) => {
      if (e.target === input) return; // Prevent double-trigger when clicking invisible input
      if (e.target.classList.contains('pa-file-preview__remove')) return;
      if (e.target.classList.contains('pa-file-dropzone__image-card-remove')) return;
      input.click();
    });

    // Drag events
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('pa-file-dropzone--active');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (e.target === dropzone) {
        dropzone.classList.remove('pa-file-dropzone--active');
      }
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('pa-file-dropzone--active');

      const files = Array.from(e.dataTransfer.files).filter(isImageFile);
      handleFiles(files);
    });

    // Input change
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files).filter(isImageFile);
      handleFiles(files);
    });

    function handleFiles(files) {
      selectedFiles = [...selectedFiles, ...files];

      if (filesInside) {
        renderImagesInside(selectedFiles);
      } else {
        renderPreviews(selectedFiles, previewContainer);
      }
    }

    function renderImagesInside(files) {
      // Remove existing content
      const existingContent = dropzone.querySelector('.pa-file-dropzone__content');
      const existingPrompt = dropzone.querySelector('.pa-file-dropzone__drop-prompt');
      const existingGrid = dropzone.querySelector('.pa-file-dropzone__files-grid');

      if (existingContent) existingContent.remove();

      // Create or update drop prompt
      if (!existingPrompt) {
        const prompt = document.createElement('div');
        prompt.className = 'pa-file-dropzone__drop-prompt';
        prompt.innerHTML = '<span class="pa-file-dropzone__drop-prompt-icon">🖼️</span> Drop images here or click to browse';
        dropzone.insertBefore(prompt, dropzone.firstChild);
      }

      // Create or get files grid
      let filesGrid = existingGrid;
      if (!filesGrid) {
        filesGrid = document.createElement('div');
        filesGrid.className = 'pa-file-dropzone__files-grid';
        dropzone.appendChild(filesGrid);
      }

      // Render images
      if (files.length === 0) {
        filesGrid.innerHTML = '';
        return;
      }

      filesGrid.innerHTML = '';
      files.forEach((file, index) => {
        createImagePreview(file, (dataUrl) => {
          if (!dataUrl) return;

          const imageCard = document.createElement('div');
          imageCard.className = 'pa-file-dropzone__image-card';
          imageCard.innerHTML = `
            <img src="${dataUrl}" alt="${escapeHtml(file.name)}">
            <button type="button" class="pa-file-dropzone__image-card-remove" data-index="${index}"></button>
          `;

          filesGrid.appendChild(imageCard);

          // Attach remove handler
          imageCard.querySelector('.pa-file-dropzone__image-card-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFiles.splice(index, 1);
            renderImagesInside(selectedFiles);
          });
        });
      });
    }

    function renderPreviews(files, container) {
      if (files.length === 0) {
        container.innerHTML = '';
        return;
      }

      container.innerHTML = '';
      files.forEach((file, index) => {
        createImagePreview(file, (dataUrl) => {
          if (!dataUrl) return;

          const previewDiv = document.createElement('div');
          previewDiv.className = 'pa-file-preview';
          previewDiv.innerHTML = `
            <img src="${dataUrl}" alt="${escapeHtml(file.name)}" class="pa-file-preview__image">
            <button type="button" class="pa-file-preview__remove" data-index="${index}"></button>
            <div class="pa-file-preview__overlay">${escapeHtml(file.name)}</div>
          `;

          container.appendChild(previewDiv);

          // Attach remove handler
          previewDiv.querySelector('.pa-file-preview__remove').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFiles.splice(index, 1);
            renderPreviews(selectedFiles, container);
          });
        });
      });
    }
  }

  // ============================================================================
  // Section 6: File List with Details
  // ============================================================================

  function initDetailedFileList(dropzoneId, listId) {
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone) return;

    const input = dropzone.querySelector('.pa-file-dropzone__input');
    const listContainer = document.getElementById(listId);
    const filesInside = dropzone.dataset.filesInside === 'true';
    let selectedFiles = [];

    // Click to browse
    dropzone.addEventListener('click', (e) => {
      if (e.target === input) return; // Prevent double-trigger when clicking invisible input
      if (e.target.classList.contains('pa-file-item__remove')) return;
      if (e.target.classList.contains('pa-file-dropzone__file-card-remove')) return;
      input.click();
    });

    // Drag events
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('pa-file-dropzone--active');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (e.target === dropzone) {
        dropzone.classList.remove('pa-file-dropzone--active');
      }
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('pa-file-dropzone--active');

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    });

    // Input change
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    });

    function handleFiles(files) {
      selectedFiles = [...selectedFiles, ...files];

      if (filesInside) {
        renderFilesInsideDetailed(selectedFiles);
      } else {
        renderDetailedList(selectedFiles, listContainer);
      }
    }

    function renderFilesInsideDetailed(files) {
      // Remove existing content
      const existingContent = dropzone.querySelector('.pa-file-dropzone__content');
      const existingPrompt = dropzone.querySelector('.pa-file-dropzone__drop-prompt');
      const existingGrid = dropzone.querySelector('.pa-file-dropzone__files-grid');

      if (existingContent) existingContent.remove();

      // Create or update drop prompt
      if (!existingPrompt) {
        const prompt = document.createElement('div');
        prompt.className = 'pa-file-dropzone__drop-prompt';
        prompt.innerHTML = '<span class="pa-file-dropzone__drop-prompt-icon">📁</span> Drop files here or click to browse';
        dropzone.insertBefore(prompt, dropzone.firstChild);
      }

      // Create or get files grid
      let filesGrid = existingGrid;
      if (!filesGrid) {
        filesGrid = document.createElement('div');
        filesGrid.className = 'pa-file-dropzone__files-grid';
        dropzone.appendChild(filesGrid);
      }

      // Render files
      if (files.length === 0) {
        filesGrid.innerHTML = '';
        return;
      }

      filesGrid.innerHTML = files.map((file, index) => {
        const iconEmoji = getFileIconEmojiDetailed(file.name);
        return `
          <div class="pa-file-dropzone__file-card">
            <div class="pa-file-dropzone__file-card-icon">${iconEmoji}</div>
            <div class="pa-file-dropzone__file-card-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
            <div class="pa-file-dropzone__file-card-size">${formatFileSize(file.size)}</div>
            <button type="button" class="pa-file-dropzone__file-card-remove" data-index="${index}"></button>
          </div>
        `;
      }).join('');

      // Attach remove handlers
      filesGrid.querySelectorAll('.pa-file-dropzone__file-card-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          selectedFiles.splice(index, 1);
          renderFilesInsideDetailed(selectedFiles);
        });
      });
    }

    function getFileIconEmojiDetailed(filename) {
      const type = getFileType(filename);
      const icons = {
        pdf: '📄',
        doc: '📝', docx: '📝',
        xls: '📊', xlsx: '📊',
        zip: '🗜️', rar: '🗜️',
        image: '🖼️',
        video: '🎬',
        audio: '🎵',
        txt: '📃',
        default: '📁'
      };
      return icons[type] || icons.default;
    }

    function renderDetailedList(files, container) {
      if (files.length === 0) {
        container.innerHTML = '';
        return;
      }

      container.innerHTML = files.map((file, index) => `
        <div class="pa-file-item">
          <div class="pa-file-item__icon">
            <div class="${getFileIconClass(file.name)}"></div>
          </div>
          <div class="pa-file-info">
            <div class="pa-file-item__name">${escapeHtml(file.name)}</div>
            <div class="pa-file-item__meta">
              ${formatFileSize(file.size)} • ${file.type || 'Unknown type'}
            </div>
          </div>
          <button type="button" class="pa-file-item__remove" data-index="${index}"></button>
        </div>
      `).join('');

      // Attach remove handlers
      container.querySelectorAll('.pa-file-item__remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          selectedFiles.splice(index, 1);
          renderDetailedList(selectedFiles, container);
        });
      });
    }
  }

  // ============================================================================
  // Section 7: File Validation
  // ============================================================================

  function initValidatedDropzone(dropzoneId, errorId, successId) {
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone) return;

    const input = dropzone.querySelector('.pa-file-dropzone__input');
    const errorAlert = document.getElementById(errorId);
    const successAlert = document.getElementById(successId);
    const maxSize = parseInt(input.dataset.maxSize) || 2097152; // Default 2MB
    const acceptTypes = input.accept.split(',').map(t => t.trim());

    // Click to browse
    dropzone.addEventListener('click', (e) => {
      if (e.target === input) return; // Prevent double-trigger when clicking invisible input
      input.click();
    });

    // Drag events
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('pa-file-dropzone--active');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (e.target === dropzone) {
        dropzone.classList.remove('pa-file-dropzone--active');
      }
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('pa-file-dropzone--active');

      if (e.dataTransfer.files.length > 0) {
        validateFile(e.dataTransfer.files[0]);
      }
    });

    // Input change
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        validateFile(e.target.files[0]);
      }
    });

    function validateFile(file) {
      // Hide previous messages
      errorAlert.style.display = 'none';
      successAlert.style.display = 'none';

      // Check file size
      if (file.size > maxSize) {
        showError(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return;
      }

      // Check file type
      const fileType = file.type;
      const isValidType = acceptTypes.some(type => {
        if (type === fileType) return true;
        if (type.endsWith('/*') && fileType.startsWith(type.replace('/*', '/'))) return true;
        return false;
      });

      if (!isValidType) {
        showError(`Invalid file type. Accepted types: ${acceptTypes.join(', ')}`);
        return;
      }

      // Validation passed
      showSuccess(`✓ File validated: ${file.name} (${formatFileSize(file.size)})`);
    }

    function showError(message) {
      errorAlert.textContent = message;
      errorAlert.style.display = 'block';
      input.value = ''; // Clear input
    }

    function showSuccess(message) {
      successAlert.textContent = message;
      successAlert.style.display = 'block';
    }
  }

  // ============================================================================
  // Section 8: Upload Progress
  // ============================================================================

  function initUploadProgress(dropzoneId, listId, buttonId) {
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone) return;

    const input = dropzone.querySelector('.pa-file-dropzone__input');
    const listContainer = document.getElementById(listId);
    const uploadBtn = document.getElementById(buttonId);
    const filesInside = dropzone.dataset.filesInside === 'true';
    let selectedFiles = [];

    // Click to browse
    dropzone.addEventListener('click', (e) => {
      if (e.target === input) return; // Prevent double-trigger when clicking invisible input
      if (e.target.classList.contains('pa-file-item__remove')) return;
      if (e.target.classList.contains('pa-file-dropzone__file-card-remove')) return;
      input.click();
    });

    // Drag events
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('pa-file-dropzone--active');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (e.target === dropzone) {
        dropzone.classList.remove('pa-file-dropzone--active');
      }
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('pa-file-dropzone--active');

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    });

    // Input change
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    });

    function handleFiles(files) {
      selectedFiles = [...selectedFiles, ...files];
      renderFileListWithProgress(selectedFiles, listContainer, 0);
      uploadBtn.style.display = selectedFiles.length > 0 ? 'inline-flex' : 'none';
    }

    function renderFileListWithProgress(files, container, progress = 0) {
      if (files.length === 0) {
        container.innerHTML = '';
        return;
      }

      container.innerHTML = files.map((file, index) => {
        const statusClass = progress >= 100 ? 'pa-file-progress__status--complete' : '';
        const statusText = progress >= 100 ? 'Complete' : progress > 0 ? `${progress}%` : 'Pending';

        return `
          <div class="pa-file-item">
            <div class="pa-file-item__icon">
              <div class="${getFileIconClass(file.name)}"></div>
            </div>
            <div class="pa-file-info">
              <div class="pa-file-item__name">${escapeHtml(file.name)}</div>
              <div class="pa-file-item__meta">${formatFileSize(file.size)}</div>
              ${progress > 0 ? `
                <div class="pa-file-progress">
                  <div class="pa-file-progress__bar">
                    <div class="pa-file-progress__fill" style="width: ${progress}%"></div>
                  </div>
                  <div class="pa-file-progress__text">
                    <span class="pa-file-progress__status ${statusClass}">${statusText}</span>
                  </div>
                </div>
              ` : ''}
            </div>
            ${progress === 0 ? `<button type="button" class="pa-file-item__remove" data-index="${index}"></button>` : ''}
          </div>
        `;
      }).join('');

      // Attach remove handlers (only if not uploading)
      if (progress === 0) {
        container.querySelectorAll('.pa-file-item__remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            selectedFiles.splice(index, 1);
            renderFileListWithProgress(selectedFiles, container, 0);
            uploadBtn.style.display = selectedFiles.length > 0 ? 'inline-flex' : 'none';
          });
        });
      }
    }

    // Upload button click
    uploadBtn.addEventListener('click', () => {
      uploadBtn.disabled = true;
      simulateUpload();
    });

    function simulateUpload() {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          uploadBtn.disabled = false;
        }
        renderFileListWithProgress(selectedFiles, listContainer, Math.floor(progress));
      }, 200);
    }
  }

  // ============================================================================
  // Section 9: Ultra-Compact Modal Mode
  // ============================================================================

  function initCompactModal(dropzoneId, buttonId = null) {
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone) return;

    const input = dropzone.querySelector('.pa-file-dropzone__input');
    const uploadBtn = buttonId ? document.getElementById(buttonId) : null;
    let selectedFiles = [];
    let fileStates = []; // Track progress and status for each file
    let currentUploadIndex = -1;
    let modal = null;

    // Click to browse
    dropzone.addEventListener('click', (e) => {
      if (e.target === input) return;
      if (e.target.classList.contains('pa-file-dropzone__summary-count')) return;
      input.click();
    });

    // Drag events
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('pa-file-dropzone--active');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (e.target === dropzone) {
        dropzone.classList.remove('pa-file-dropzone--active');
      }
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('pa-file-dropzone--active');

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    });

    // Input change
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    });

    // Drag overlay feature
    const overlayTargetId = dropzone.dataset.overlayTarget;
    let dragOverlay = null;

    if (overlayTargetId) {
      // Listen for drag enter on document
      document.addEventListener('dragenter', (e) => {
        // Check if dragging files
        if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
          const targetElement = document.getElementById(overlayTargetId);
          if (targetElement && !dragOverlay) {
            createOverlay(targetElement);
          }
        }
      });

      function createOverlay(targetElement) {
        const rect = targetElement.getBoundingClientRect();

        dragOverlay = document.createElement('div');
        dragOverlay.className = 'pa-file-dropzone-overlay';
        dragOverlay.style.cssText = `
          position: fixed;
          top: ${rect.top}px;
          left: ${rect.left}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          z-index: 9999;
          pointer-events: all;
        `;

        dragOverlay.innerHTML = `
          <div class="pa-file-dropzone-overlay__content">
            <div class="pa-file-dropzone-overlay__icon">📎</div>
            <div class="pa-file-dropzone-overlay__text">Drop files here</div>
          </div>
        `;

        document.body.appendChild(dragOverlay);

        // Handle drop on overlay
        dragOverlay.addEventListener('dragover', (e) => {
          e.preventDefault();
        });

        dragOverlay.addEventListener('drop', (e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files);
          handleFiles(files);
          removeOverlay();
        });

        dragOverlay.addEventListener('dragleave', (e) => {
          if (e.target === dragOverlay) {
            removeOverlay();
          }
        });
      }

      function removeOverlay() {
        if (dragOverlay) {
          dragOverlay.remove();
          dragOverlay = null;
        }
      }

      // Remove on window blur or ESC
      window.addEventListener('blur', removeOverlay);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') removeOverlay();
      });
    }

    function handleFiles(files) {
      selectedFiles = [...selectedFiles, ...files];
      fileStates = selectedFiles.map((file, index) => ({
        file,
        progress: 0,
        status: 'pending' // pending, uploading, complete, error
      }));
      renderSummary();
      if (uploadBtn) {
        uploadBtn.style.display = selectedFiles.length > 0 ? 'inline-flex' : 'none';
      }
    }

    function renderSummary() {
      // Remove existing content and old summaries
      const existingContent = dropzone.querySelector('.pa-file-dropzone__content');
      const existingSummary = dropzone.querySelector('.pa-file-dropzone__summary');
      if (existingContent) existingContent.remove();
      if (existingSummary) existingSummary.remove();

      // Calculate total size
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

      // Create summary
      const summary = document.createElement('div');
      summary.className = 'pa-file-dropzone__summary';

      const currentFile = currentUploadIndex >= 0 && currentUploadIndex < selectedFiles.length
        ? selectedFiles[currentUploadIndex].name
        : 'Click to select files';

      const currentProgress = currentUploadIndex >= 0
        ? fileStates[currentUploadIndex].progress
        : 0;

      summary.innerHTML = `
        <div class="pa-file-dropzone__summary-line">
          <span class="pa-file-dropzone__summary-icon">📎</span>
          <span class="pa-file-dropzone__summary-count">${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}</span>
          <span class="pa-file-dropzone__summary-size">(${formatFileSize(totalSize)})</span>
          <span>Click to view details</span>
        </div>
        ${currentUploadIndex >= 0 ? `
          <div class="pa-file-dropzone__summary-current">
            Uploading ${currentUploadIndex + 1} of ${selectedFiles.length} files: ${escapeHtml(currentFile)}
          </div>
          <div class="pa-file-dropzone__summary-progress">
            <div class="pa-file-progress__bar">
              <div class="pa-file-progress__fill" style="width: ${currentProgress}%"></div>
            </div>
          </div>
        ` : ''}
      `;

      dropzone.appendChild(summary);

      // Attach click handler to entire summary line
      const summaryLine = summary.querySelector('.pa-file-dropzone__summary-line');
      if (summaryLine && selectedFiles.length > 0) {
        summaryLine.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!modal) {  // Only open if not already open
            openModal();
          }
        });
      }
    }

    function openModal() {
      // Prevent duplicate modals
      if (modal) return;

      // Get reference element (the dropzone itself for alignment)
      const referenceEl = dropzone;

      // Create popover
      modal = document.createElement('div');
      modal.className = 'pa-file-popover';
      modal.innerHTML = `
        <div class="pa-file-popover__arrow" data-popper-arrow></div>
        <div class="pa-file-popover__header">
          <h3 class="pa-file-popover__title">Selected Files (${selectedFiles.length})</h3>
          <button type="button" class="pa-file-popover__close">×</button>
        </div>
        <div class="pa-file-popover__body">
          <table class="pa-file-popover__table">
            <thead>
              <tr>
                <th style="width: 1%;"></th>
                <th>Name</th>
                <th>Size</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${fileStates.map((state, index) => {
                const isUploading = index === currentUploadIndex;
                const canRemove = state.status === 'pending' && currentUploadIndex < 0;
                return `
                  <tr class="${isUploading ? 'uploading' : ''}" data-index="${index}">
                    <td class="pa-file-popover__remove-cell">
                      ${canRemove ? `
                        <button type="button" class="pa-file-popover__remove-btn" data-index="${index}">×</button>
                      ` : ''}
                    </td>
                    <td>
                      <div class="pa-file-popover__file-name" title="${escapeHtml(state.file.name)}">
                        ${escapeHtml(state.file.name)}
                      </div>
                    </td>
                    <td class="pa-file-popover__file-size">${formatFileSize(state.file.size)}</td>
                    <td class="pa-file-popover__progress-cell">
                      <div class="pa-file-popover__progress-bar">
                        <div class="pa-file-popover__progress-fill" style="width: ${state.progress}%"></div>
                      </div>
                      <div class="pa-file-popover__progress-text">${state.progress}%</div>
                    </td>
                    <td>
                      <span class="pa-file-popover__status pa-file-popover__status--${state.status}">
                        ${state.status}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      document.body.appendChild(modal);

      // Position with Floating UI
      const { computePosition, flip, shift, offset, arrow } = window.FloatingUIDOM;
      const arrowEl = modal.querySelector('.pa-file-popover__arrow');

      async function updatePosition() {
        const { x, y, placement, middlewareData } = await computePosition(referenceEl, modal, {
          placement: 'bottom-start',
          middleware: [
            offset(8),
            flip(),
            shift({ padding: 8 }),
            arrow({ element: arrowEl })
          ]
        });

        Object.assign(modal.style, {
          left: `${x}px`,
          top: `${y}px`
        });

        // Position arrow
        if (middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = middlewareData.arrow;
          const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right'
          }[placement.split('-')[0]];

          Object.assign(arrowEl.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide]: '-4px'
          });
        }
      }

      updatePosition();

      // Close handlers
      const closeBtn = modal.querySelector('.pa-file-popover__close');
      closeBtn.addEventListener('click', closeModal);

      // Click outside to close
      setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
      }, 0);

      document.addEventListener('keydown', handleEscKey);

      // Remove button handlers
      const removeButtons = modal.querySelectorAll('.pa-file-popover__remove-btn');
      removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          removeFile(index);
        });
      });
    }

    function handleOutsideClick(e) {
      if (modal && !modal.contains(e.target) && !dropzone.contains(e.target)) {
        closeModal();
      }
    }

    function removeFile(index) {
      // Remove file from arrays
      selectedFiles.splice(index, 1);
      fileStates.splice(index, 1);

      // Update display
      renderSummary();

      // Update or close modal
      if (selectedFiles.length === 0) {
        closeModal();
        if (uploadBtn) {
          uploadBtn.style.display = 'none';
        }
      } else if (modal) {
        // Re-render modal
        closeModal();
        openModal();
      }
    }

    function closeModal() {
      if (modal) {
        document.removeEventListener('keydown', handleEscKey);
        document.removeEventListener('click', handleOutsideClick);
        modal.remove();
        modal = null;
      }
    }

    function handleEscKey(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }

    function updateModalProgress() {
      if (!modal) return;

      const tbody = modal.querySelector('tbody');
      fileStates.forEach((state, index) => {
        const row = tbody.querySelector(`tr[data-index="${index}"]`);
        if (!row) return;

        // Update row highlight
        row.className = index === currentUploadIndex ? 'uploading' : '';

        // Update progress bar and text
        const progressFill = row.querySelector('.pa-file-popover__progress-fill');
        const progressText = row.querySelector('.pa-file-popover__progress-text');
        const statusSpan = row.querySelector('.pa-file-popover__status');

        if (progressFill) progressFill.style.width = `${state.progress}%`;
        if (progressText) progressText.textContent = `${state.progress.toFixed(2)}%`;
        if (statusSpan) {
          statusSpan.textContent = state.status;
          statusSpan.className = `pa-file-popover__status pa-file-popover__status--${state.status}`;
        }
      });
    }

    // Upload button handler
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        uploadBtn.disabled = true;
        simulateUpload();
      });
    }

    function simulateUpload() {
      if (selectedFiles.length === 0) return;

      currentUploadIndex = 0;
      uploadNextFile();
    }

    function uploadNextFile() {
      if (currentUploadIndex >= selectedFiles.length) {
        // All done
        currentUploadIndex = -1;
        if (uploadBtn) uploadBtn.disabled = false;
        renderSummary();
        return;
      }

      fileStates[currentUploadIndex].status = 'uploading';
      fileStates[currentUploadIndex].progress = 0;
      renderSummary();
      updateModalProgress();

      const interval = setInterval(() => {
        fileStates[currentUploadIndex].progress += Math.random() * 15;
        // Round to 2 decimal places
        fileStates[currentUploadIndex].progress = Math.round(fileStates[currentUploadIndex].progress * 100) / 100;

        if (fileStates[currentUploadIndex].progress >= 100) {
          fileStates[currentUploadIndex].progress = 100;
          fileStates[currentUploadIndex].status = 'complete';
          clearInterval(interval);

          renderSummary();
          updateModalProgress();

          // Move to next file
          currentUploadIndex++;
          setTimeout(uploadNextFile, 300);
        } else {
          renderSummary();
          updateModalProgress();
        }
      }, 200);
    }
  }

  // ============================================================================
  // Utility: Escape HTML
  // ============================================================================

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================================================
  // Initialize All Sections
  // ============================================================================

  document.addEventListener('DOMContentLoaded', () => {
    // Section 1: Basic file input - single
    initBasicFileInput('file-single');

    // Section 2: Basic file input - multiple
    initBasicFileInput('file-multiple');

    // Section 3: Drag & drop - single
    initDropzone('dropzone-single');

    // Section 4: Drag & drop - multiple with list
    initDropzone('dropzone-multiple', 'dropzone-multiple-list');

    // Section 5: Image preview with thumbnails
    initImagePreview('dropzone-preview', 'preview-container');

    // Section 6: File list with details
    initDetailedFileList('dropzone-detailed', 'detailed-file-list');

    // Section 7: File validation
    initValidatedDropzone('dropzone-validated', 'validation-error', 'validation-success');

    // Section 8: Upload progress
    initUploadProgress('dropzone-progress', 'progress-file-list', 'upload-btn');

    // Compact mode examples
    initDropzone('dropzone-compact');
    initImagePreview('dropzone-compact-images');

    // Ultra-compact modal mode
    initCompactModal('dropzone-ultracompact', 'upload-ultracompact-btn');
  });

})();
