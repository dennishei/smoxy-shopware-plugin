import Plugin from 'src/plugin-system/plugin.class';

/**
 * SMOXY Account Overlay Plugin
 * 
 * Converts the account widget dropdown from server-side rendering to AJAX-based loading
 * for better caching performance. Maintains 1:1 visual compatibility with the original.
 * 
 * @package Smoxy
 * @author Dennis Heidtmann <dennis.heidtmann@gmail.com>
 * @version 1.0.0
 */
export default class AccountOverlayPlugin extends Plugin {
    
    static options = {
        overlayUrl: '/account/overlay',
        configUrl: '/account/overlay/config',
        triggerSelector: '[data-account-overlay-trigger]',
        contentSelector: '[data-account-overlay-content]',
        cacheTimeout: 300000, // 5 minutes (fallback)
        loadOnHover: true,
        loadOnClick: false,
    };

    /**
     * Initialize the plugin
     */
    init() {
        this.cache = new Map();
        this.isLoading = false;
        this.isInitialized = false;
        this.hideTimeout = null;
        this.configLoaded = false;
        
        this.loadConfig().then(() => {
            this.registerEvents();
        }).catch((error) => {
            console.error('SMOXY AccountOverlay: Config loading failed, using defaults', error);
            this.registerEvents();
        });
    }

    /**
     * Load plugin configuration from server
     */
    async loadConfig() {
        try {
            const response = await fetch(this.options.configUrl, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const config = await response.json();
                // Update options with server configuration
                this.options.cacheTimeout = config.cacheTimeout || this.options.cacheTimeout;
                this.options.loadOnHover = config.loadOnHover !== undefined ? config.loadOnHover : this.options.loadOnHover;
                this.options.loadOnClick = config.loadOnClick !== undefined ? config.loadOnClick : this.options.loadOnClick;
                this.options.enableCaching = config.enableCaching !== undefined ? config.enableCaching : true;
                this.configLoaded = true;
            }
        } catch (error) {
            console.error('SMOXY AccountOverlay: Failed to load configuration', error);
        }
    }

    /**
     * Register event listeners for hover and click interactions
     */
    registerEvents() {
        const trigger = document.querySelector(this.options.triggerSelector);
        const content = document.querySelector(this.options.contentSelector);
        
        if (!trigger || !content) {
            return;
        }

        this.trigger = trigger;
        this.content = content;
        this.dropdown = this.trigger.nextElementSibling;
        this.nameElement = this.trigger.querySelector('[data-account-name]');

        // Apply configuration-based event registration

        if (this.options.loadOnHover) {
            this.trigger.addEventListener('mouseenter', this.onTriggerHover.bind(this));
            this.trigger.addEventListener('mouseleave', this.onMouseLeave.bind(this));
            
            if (this.dropdown) {
                this.dropdown.addEventListener('mouseenter', this.onDropdownEnter.bind(this));
                this.dropdown.addEventListener('mouseleave', this.onDropdownLeave.bind(this));
            }
        }

        if (this.options.loadOnClick) {
            this.trigger.addEventListener('click', this.onTriggerClick.bind(this));
        }

        // Clear cache on customer state changes
        document.addEventListener('customer-login', this.clearCache.bind(this));
        document.addEventListener('customer-logout', this.clearCache.bind(this));
    }

    /**
     * Handle hover on trigger element
     */
    onTriggerHover(event) {
        // Bootstrap dropdown will handle the show/hide via data-bs-toggle
        // We only need to load the content
        if (!this.isInitialized && !this.isLoading) {
            this.loadOverlayContent();
        }
    }

    /**
     * Handle click on trigger element
     */
    onTriggerClick(event) {
        // Don't prevent default for Bootstrap dropdown functionality
        if (!this.isInitialized) {
            this.loadOverlayContent();
        }
    }

    /**
     * Handle mouse leave from trigger with delay
     */
    onMouseLeave(event) {
        this.hideTimeout = setTimeout(() => {
            this.hideDropdown();
        }, 200);
    }

    /**
     * Handle mouse enter on dropdown (cancel hide timeout)
     */
    onDropdownEnter(event) {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    /**
     * Handle mouse leave from dropdown (immediate hide)
     */
    onDropdownLeave(event) {
        this.hideDropdown();
    }

    /**
     * Show the dropdown menu
     */
    showDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.add('show');
            this.trigger.setAttribute('aria-expanded', 'true');
        }
    }

    /**
     * Hide the dropdown menu
     */
    hideDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.remove('show');
            this.trigger.setAttribute('aria-expanded', 'false');
        }
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    /**
     * Load account overlay content via AJAX
     */
    async loadOverlayContent() {
        if (this.isLoading) {
            return;
        }

        const cacheKey = 'account-overlay';
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData) {
            this.renderContent(cachedData);
            this.isInitialized = true;
            return;
        }

        this.isLoading = true;

        try {
            const response = await fetch(this.options.overlayUrl, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            this.setCachedData(cacheKey, data);
            this.renderContent(data);
            this.isInitialized = true;
        } catch (error) {
            console.error('SMOXY AccountOverlay: Failed to load content', error);
            this.renderError();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render account overlay content based on user login status
     */
    renderContent(data) {
        let html = '';
        
        if (data.isLoggedIn) {
            // Logged in user - match original sidebar structure
            html = `
                <div class="account-menu">
                    <div class="dropdown-header account-menu-header">
                        Ihr Konto
                    </div>
                    <div class="account-menu-links">
                        <div class="header-account-menu">
                            <div class="card account-menu-inner">
                                <nav class="list-group list-group-flush account-aside-list-group">
                                    <a href="${data.links.overview}" 
                                       title="Übersicht" 
                                       class="list-group-item list-group-item-action account-aside-item">
                                        Übersicht
                                    </a>
                                    <a href="${data.links.profile}" 
                                       title="Persönliches Profil" 
                                       class="list-group-item list-group-item-action account-aside-item">
                                        Persönliches Profil
                                    </a>
                                    <a href="${data.links.addresses}" 
                                       title="Adressen" 
                                       class="list-group-item list-group-item-action account-aside-item">
                                        Adressen
                                    </a>
                                    <a href="${data.links.orders}" 
                                       title="Bestellungen" 
                                       class="list-group-item list-group-item-action account-aside-item">
                                        Bestellungen
                                    </a>
                                </nav>
                                <div class="card-footer account-aside-footer">
                                    <a href="${data.links.logout}" class="btn btn-link account-aside-btn">
                                        Abmelden
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Guest user - match original login structure
            html = `
                <div class="account-menu">
                    <div class="account-menu-login">
                        <a href="${data.links.login}" 
                           title="Anmelden" 
                           class="btn btn-primary account-menu-login-button">
                            Anmelden
                        </a>
                        <div class="account-menu-register">
                            oder <a href="${data.links.register}" title="Registrieren">registrieren</a>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.content.innerHTML = html;
        this.content.classList.add('account-overlay-loaded');
        
        // Update the name in the button if user is logged in
        if (data.isLoggedIn && this.nameElement) {
            this.nameElement.textContent = data.customerName || '';
        } else if (this.nameElement) {
            this.nameElement.textContent = '';
        }
        
        // Re-initialize plugins for new content
        window.PluginManager.initializePlugins();
        
        // Trigger event for other plugins
        document.dispatchEvent(new CustomEvent('account-overlay-loaded', {
            detail: { content: this.content }
        }));
    }

    /**
     * Render error message when AJAX request fails
     */
    renderError() {
        this.content.innerHTML = `
            <div class="account-overlay-error">
                <p>Fehler beim Laden des Account-Menüs. Bitte versuchen Sie es später erneut.</p>
                <a href="/account/login" class="btn btn-primary">Zur Anmeldung</a>
            </div>
        `;
        this.content.classList.add('account-overlay-error');
    }

    /**
     * Get cached data if still valid
     */
    getCachedData(key) {
        if (!this.options.enableCaching) {
            return null;
        }
        
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.options.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    /**
     * Store data in cache with timestamp
     */
    setCachedData(key, data) {
        if (this.options.enableCaching) {
            this.cache.set(key, {
                data: data,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Clear cache and reset initialization state
     */
    clearCache() {
        this.cache.clear();
        this.isInitialized = false;
        this.content.classList.remove('account-overlay-loaded');
        
        // Clear the name from the button
        if (this.nameElement) {
            this.nameElement.textContent = '';
        }
    }
}