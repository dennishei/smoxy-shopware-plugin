import AccountOverlayPlugin from './plugin/smoxy/account-overlay.plugin';

const PluginManager = window.PluginManager;

PluginManager.register('AccountOverlay', AccountOverlayPlugin, '[data-account-overlay]');