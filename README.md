# SMOXY Shopware Plugin

[English Version](#english-version) | [Deutsche Version](#deutsche-version)

---

## Deutsche Version

Ein Shopware 6.7 Plugin, das das Account-Widget-Dropdown von server-seitigem Rendering auf AJAX-basiertes Laden umstellt für bessere Caching-Performance. Das Plugin ermöglicht vollständiges Page-Caching des Account-Widgets, da alle benutzerspezifischen Daten dynamisch geladen werden.

### Features

- **AJAX-basiertes Laden**: Konvertiert das Account-Overlay von Template-basiert zu AJAX-Anfragen
- **Identische Darstellung**: 1:1 Nachbildung des originalen Account-Menüs inkl. Avatar-Icon
- **Dynamischer Content**: Benutzername und Menu-Inhalte werden vollständig dynamisch geladen
- **Vollständiges Page-Caching**: Ermöglicht Caching des gesamten Account-Widgets ohne benutzerspezifische Daten
- **Intelligentes Caching**: Client-seitiges Caching mit konfigurierbarem Timeout
- **Flexible Interaktionen**: Konfigurierbare Hover- und Click-Interaktionen
- **Performance-optimiert**: Maximale Cache-Effizienz durch Trennung von statischen und dynamischen Inhalten
- **Admin-Interface**: Vollständige Konfiguration über Shopware Administration

### Installation

1. Plugin in `custom/plugins/Smoxy/` platzieren
2. Plugin installieren: `bin/console plugin:install Smoxy`
3. Plugin aktivieren: `bin/console plugin:activate Smoxy`
4. Cache leeren: `bin/console cache:clear`
5. Theme kompilieren: `bin/console theme:compile`

### Konfiguration

Das Plugin kann über die Shopware Administration konfiguriert werden:

**Settings → System → Plugins → SMOXY Account Overlay → Konfiguration**

#### Verfügbare Einstellungen:

- **Caching aktivieren**: Ein/Aus-Schalter für das Client-seitige Caching
- **Cache-Timeout**: Dauer in Sekunden (0-3600), wie lange das Overlay gecacht wird
- **Laden beim Hover**: Aktiviert das Laden beim Hover über das Account-Icon
- **Laden beim Klick**: Aktiviert das Laden beim Klick auf das Account-Icon

### Technische Details

#### API Endpoints

- **Overlay-Daten**: `GET /account/overlay` - Liefert Account-Menu-Daten als JSON
- **Konfiguration**: `GET /account/overlay/config` - Liefert Plugin-Konfiguration als JSON

#### API Response

**Für Gast-Benutzer:**
```json
{
  "isLoggedIn": false,
  "links": {
    "login": "/account/login",
    "register": "/account/login"
  },
  "config": {
    "enableCaching": true,
    "cacheTimeout": 300,
    "loadOnHover": false,
    "loadOnClick": true
  }
}
```

**Für eingeloggte Benutzer:**
```json
{
  "isLoggedIn": true,
  "customerName": "Dennis",
  "customerEmail": "dennis@example.com",
  "links": {
    "overview": "/account",
    "profile": "/account/profile",
    "addresses": "/account/address",
    "orders": "/account/order",
    "logout": "/account/logout"
  },
  "config": {
    "enableCaching": true,
    "cacheTimeout": 300,
    "loadOnHover": false,
    "loadOnClick": true
  }
}
```

#### Architektur

- **Controller**: `AccountOverlayController` - Liefert JSON-Response basierend auf Login-Status
- **JavaScript Plugin**: `AccountOverlayPlugin` - Verwaltet Interaktionen und AJAX-Loading
- **Template Override**: Erweitert das originale Account-Widget-Template ohne benutzerspezifische Daten
- **Route-Konfiguration**: AJAX-Endpoints für Overlay-Daten und Konfiguration
- **System-Konfiguration**: Admin-Interface für Plugin-Einstellungen
- **Dynamische Inhalte**: Benutzername wird via AJAX in den Button geladen

### Kompatibilität

- **Shopware Version**: 6.7.0.1+
- **PHP Version**: 8.1+
- **Browser-Unterstützung**: Alle modernen Browser mit fetch() API

### Support

- **Version**: 1.0.0
- **Autor**: SMOXY
- **Lizenz**: Proprietär

---

## English Version

A Shopware 6.7 plugin that converts the account widget dropdown from server-side rendering to AJAX-based loading for better caching performance. The plugin enables full page caching of the account widget by dynamically loading all user-specific data.

### Features

- **AJAX-based Loading**: Converts the account overlay from template-based to AJAX requests
- **Identical Appearance**: 1:1 recreation of the original account menu including avatar icon
- **Dynamic Content**: Username and menu contents are fully dynamically loaded
- **Full Page Caching**: Enables caching of the entire account widget without user-specific data
- **Smart Caching**: Client-side caching with configurable timeout
- **Flexible Interactions**: Configurable hover and click interactions
- **Performance Optimized**: Maximum cache efficiency through separation of static and dynamic content
- **Admin Interface**: Complete configuration via Shopware Administration

### Installation

1. Place plugin in `custom/plugins/Smoxy/`
2. Install plugin: `bin/console plugin:install Smoxy`
3. Activate plugin: `bin/console plugin:activate Smoxy`
4. Clear cache: `bin/console cache:clear`
5. Compile theme: `bin/console theme:compile`

### Configuration

The plugin can be configured via Shopware Administration:

**Settings → System → Plugins → SMOXY Account Overlay → Configuration**

#### Available Settings:

- **Enable Caching**: Toggle for client-side caching
- **Cache Timeout**: Duration in seconds (0-3600) how long the overlay is cached
- **Load on Hover**: Enables loading when hovering over the account icon
- **Load on Click**: Enables loading when clicking on the account icon

### Technical Details

#### API Endpoints

- **Overlay Data**: `GET /account/overlay` - Returns account menu data as JSON
- **Configuration**: `GET /account/overlay/config` - Returns plugin configuration as JSON

#### API Response

**For Guest Users:**
```json
{
  "isLoggedIn": false,
  "links": {
    "login": "/account/login",
    "register": "/account/login"
  },
  "config": {
    "enableCaching": true,
    "cacheTimeout": 300,
    "loadOnHover": false,
    "loadOnClick": true
  }
}
```

**For Logged-in Users:**
```json
{
  "isLoggedIn": true,
  "customerName": "Dennis",
  "customerEmail": "dennis@example.com",
  "links": {
    "overview": "/account",
    "profile": "/account/profile",
    "addresses": "/account/address",
    "orders": "/account/order",
    "logout": "/account/logout"
  },
  "config": {
    "enableCaching": true,
    "cacheTimeout": 300,
    "loadOnHover": false,
    "loadOnClick": true
  }
}
```

#### Architecture

- **Controller**: `AccountOverlayController` - Provides JSON response based on login status
- **JavaScript Plugin**: `AccountOverlayPlugin` - Manages interactions and AJAX loading
- **Template Override**: Extends the original account widget template without user-specific data
- **Route Configuration**: AJAX endpoints for overlay data and configuration
- **System Configuration**: Admin interface for plugin settings
- **Dynamic Content**: Username is loaded via AJAX into the button

### Compatibility

- **Shopware Version**: 6.7.0.1+
- **PHP Version**: 8.1+
- **Browser Support**: All modern browsers with fetch() API

### Support

- **Version**: 1.0.0
- **Author**: SMOXY
- **License**: MIT