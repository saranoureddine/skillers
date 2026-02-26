// Swagger Custom JavaScript - Tag Button and Search Bar Functionality
console.log('🔍 Swagger custom script loaded');

(function() {
  'use strict';

  let initialized = false;

  // Wait for Swagger UI to be fully loaded
  function initSwaggerCustomizations() {
    // Prevent multiple initializations
    if (initialized) return;

    // Check if Swagger UI container exists
    const swaggerContainer = document.querySelector('.swagger-ui');
    if (!swaggerContainer) {
      setTimeout(initSwaggerCustomizations, 200);
      return;
    }

    // Check if we already added our custom container
    if (document.getElementById('swagger-tag-search-container')) {
      initialized = true;
      return;
    }

    // Get all tags from the DOM (more reliable than window.ui)
    const tagSections = document.querySelectorAll('.swagger-ui .opblock-tag-section');
    const tags = Array.from(tagSections).map(section => {
      const tagElement = section.querySelector('.opblock-tag');
      return tagElement ? tagElement.textContent.trim() : null;
    }).filter(tag => tag !== null);

    // If no tags found yet, wait a bit more
    if (tags.length === 0) {
      setTimeout(initSwaggerCustomizations, 300);
      return;
    }

    // Find insertion point - after topbar or at the beginning of swagger-ui
    const topbar = document.querySelector('.swagger-ui .topbar');
    const swaggerWrapper = document.querySelector('.swagger-ui') || swaggerContainer;
    
    // Create custom container
    const container = document.createElement('div');
    container.id = 'swagger-tag-search-container';
    container.className = 'swagger-tag-search-container';
    container.innerHTML = `
      <div class="swagger-tag-filter-wrapper">
        <button class="swagger-tag-filter-btn" id="swagger-tag-filter-btn">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
          </svg>
          Filter by Tags
          <span class="swagger-tag-count" id="swagger-tag-count" style="display: none;">0</span>
        </button>
        <div class="swagger-tag-dropdown" id="swagger-tag-dropdown">
          ${tags.map(tag => {
            const safeId = tag.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            return `
              <div class="swagger-tag-dropdown-item">
                <input type="checkbox" id="tag-${safeId}" value="${tag}" class="tag-checkbox">
                <label for="tag-${safeId}">${tag}</label>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="swagger-search-bar">
        <input type="text" id="swagger-search-input" placeholder="Search endpoints, methods, descriptions...">
        <svg class="search-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </div>
      <button class="swagger-clear-filter" id="swagger-clear-filter" style="display: none;">
        Clear Filters
      </button>
    `;

    // Insert container
    if (topbar && topbar.nextSibling) {
      topbar.parentNode.insertBefore(container, topbar.nextSibling);
    } else if (topbar) {
      topbar.parentNode.appendChild(container);
    } else {
      swaggerWrapper.insertBefore(container, swaggerWrapper.firstChild);
    }

    console.log('✅ Swagger tag filter and search bar initialized');
    initialized = true;

    // State management
    let selectedTags = [];
    let searchQuery = '';

    // Tag filter button click handler
    const tagFilterBtn = document.getElementById('swagger-tag-filter-btn');
    const tagDropdown = document.getElementById('swagger-tag-dropdown');
    const tagCount = document.getElementById('swagger-tag-count');
    const clearFilterBtn = document.getElementById('swagger-clear-filter');

    if (tagFilterBtn) {
      tagFilterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (tagDropdown) {
          tagDropdown.classList.toggle('show');
          tagFilterBtn.classList.toggle('active');
        }
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (tagFilterBtn && tagDropdown && 
          !tagFilterBtn.contains(e.target) && 
          !tagDropdown.contains(e.target)) {
        tagDropdown.classList.remove('show');
        tagFilterBtn.classList.remove('active');
      }
    });

    // Tag checkbox change handler
    const tagCheckboxes = document.querySelectorAll('.tag-checkbox');
    tagCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          if (!selectedTags.includes(this.value)) {
            selectedTags.push(this.value);
          }
        } else {
          selectedTags = selectedTags.filter(tag => tag !== this.value);
        }
        updateTagCount();
        filterOperations();
        updateClearButton();
      });
    });

    // Search input handler
    const searchInput = document.getElementById('swagger-search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          searchQuery = this.value.toLowerCase().trim();
          filterOperations();
          updateClearButton();
        }, 300);
      });
    }

    // Clear filter button handler
    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', function() {
        selectedTags = [];
        searchQuery = '';
        tagCheckboxes.forEach(cb => cb.checked = false);
        if (searchInput) searchInput.value = '';
        updateTagCount();
        filterOperations();
        updateClearButton();
      });
    }

    // Update tag count badge
    function updateTagCount() {
      if (tagCount) {
        if (selectedTags.length > 0) {
          tagCount.textContent = selectedTags.length;
          tagCount.style.display = 'inline-flex';
        } else {
          tagCount.style.display = 'none';
        }
      }
    }

    // Update clear button visibility
    function updateClearButton() {
      if (clearFilterBtn) {
        if (selectedTags.length > 0 || searchQuery.length > 0) {
          clearFilterBtn.style.display = 'block';
        } else {
          clearFilterBtn.style.display = 'none';
        }
      }
    }

    // Filter operations based on selected tags and search query
    function filterOperations() {
      const opblocks = document.querySelectorAll('.swagger-ui .opblock');
      
      opblocks.forEach(opblock => {
        let hiddenByTag = false;
        let hiddenBySearch = false;

        // Get tag from parent section
        const tagSection = opblock.closest('.opblock-tag-section');
        const opblockTag = tagSection ? 
          (tagSection.querySelector('.opblock-tag')?.textContent.trim() || '') : '';

        // Check tag filter
        if (selectedTags.length > 0) {
          if (!opblockTag || !selectedTags.includes(opblockTag)) {
            hiddenByTag = true;
          }
        }

        // Check search filter
        if (searchQuery.length > 0) {
          const opblockText = opblock.textContent.toLowerCase();
          const method = opblock.querySelector('.opblock-summary-method')?.textContent.toLowerCase() || '';
          const path = opblock.querySelector('.opblock-summary-path')?.textContent.toLowerCase() || '';
          const summary = opblock.querySelector('.opblock-summary-description')?.textContent.toLowerCase() || '';
          
          const searchableText = method + ' ' + path + ' ' + summary + ' ' + opblockText;
          
          if (!searchableText.includes(searchQuery)) {
            hiddenBySearch = true;
          }
        }

        // Apply filters
        if (hiddenByTag) {
          opblock.classList.add('hidden-by-tag');
        } else {
          opblock.classList.remove('hidden-by-tag');
        }

        if (hiddenBySearch) {
          opblock.classList.add('hidden-by-search');
        } else {
          opblock.classList.remove('hidden-by-search');
        }
      });

      // Hide/show tag sections if all operations are hidden
      tagSections.forEach(section => {
        const sectionOpblocks = section.querySelectorAll('.opblock');
        const visibleInSection = Array.from(sectionOpblocks).some(op => 
          !op.classList.contains('hidden-by-tag') && !op.classList.contains('hidden-by-search')
        );
        
        if (!visibleInSection && sectionOpblocks.length > 0) {
          section.style.display = 'none';
        } else {
          section.style.display = '';
        }
      });
    }

    // Initial filter (in case there are default filters)
    setTimeout(() => {
      filterOperations();
    }, 500);

    // Watch for new operations being added
    const observer = new MutationObserver(() => {
      filterOperations();
    });

    if (swaggerContainer) {
      observer.observe(swaggerContainer, {
        childList: true,
        subtree: true
      });
    }
  }

  // Multiple initialization strategies
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initSwaggerCustomizations, 500);
    });
  } else {
    setTimeout(initSwaggerCustomizations, 500);
  }

  // Also try on window load
  window.addEventListener('load', function() {
    setTimeout(initSwaggerCustomizations, 1000);
  });
})();
