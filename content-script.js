(function() {
    'use strict';
    
    // ===== KONSTANTEN UND GLOBALE VARIABLEN =====
    const STORAGE_KEY = 'bitefightMenuSettings';
    const OVERLAY_SEEN_KEY = 'bitefightOverlaySeen';
    const UI_VISIBLE_KEY = 'bitefightMenuVisible';
    const CUSTOM_BUTTONS_KEY = 'bitefightCustomButtons';
    const MENU_ORDER_KEY = 'bitefightMenuOrder';
    const CUSTOM_ORDER_KEY = 'bitefightCustomOrder';
    const LANGUAGE_KEY = 'bitefightLanguage';
    const ADVANCED_SETTINGS_KEY = 'bitefightAdvancedSettings';
    
    let buttonsInserted = false;
    let uiContainer = null;
    let settingsWindow = null;
    let activeTab = 2;
    let overlay = null;
    let customMenuContainer = null;
    let menuSettings = {};
    let customButtons = [];
    let menuOrder = [];
    let customOrder = [];
    let currentLanguage = 'de'; // Standard: Deutsch
    let advancedSettings = {};
    let pageLoadStartTime = Date.now();
  
    // ===== MEHRSPRACHIGE ÜBERSETZUNGEN =====
    const translations = {
      de: {
        // UI Hauptelemente
        title: 'BiteFight-Me.Cu.',
        pressF2: 'Drücke F2',
        
        // Tabs
        tabToggle: 'Ein/Aus',
        tabCustom: 'Custom',
        tabSorting: 'Sortierung',
        
        // Tab 1: Ein/Aus
        allOn: 'Alle an',
        allOff: 'Alle aus',
        
        // Tab 2: Custom Buttons
        addNewButton: 'Neuen Button hinzufügen',
        buttonName: 'Button Name',
        buttonUrl: 'URL (https://...)',
        openInNewTab: 'In neuem Tab öffnen',
        addButton: 'Button hinzufügen',
        manageExistingButtons: 'Bestehende Buttons verwalten',
        noButtonsAvailable: 'Keine Buttons vorhanden',
        newTab: 'Neuer Tab',
        sameTab: 'Gleicher Tab',
        editButton: 'Button bearbeiten',
        deleteButton: 'Button löschen',
        confirmDelete: 'Button "{0}" löschen?',
        pleaseEnterNameAndUrl: 'Bitte Name und URL eingeben!',
        
        // Tab 3: Sortierung
        menuSorting: 'Menü-Sortierung',
        sortingDescription: 'Sortiere Standard-Menüpunkte und Custom Buttons separat.',
        autoSaveNote: '<strong>Automatisches Speichern:</strong> Änderungen werden automatisch gespeichert und die Seite wird neu geladen.',
        upArrow: '↑ = Nach oben',
        downArrow: '↓ = Nach unten',
        standardReset: 'Standard Reset',
        customReset: 'Custom Reset',
        sortStandardMenuItems: 'Standard-Menüpunkte sortieren',
        sortCustomButtons: 'Custom Buttons sortieren',
        noCustomButtonsAvailable: 'Keine Custom Buttons vorhanden',
        standard: '[Standard]',
        custom: '[Custom]',
        confirmStandardReset: 'Standard-Reihenfolge wiederherstellen?',
        confirmCustomReset: 'Custom-Reihenfolge wiederherstellen?',
        
        // Edit Dialog
        editButtonTitle: 'Button bearbeiten',
        buttonNameLabel: 'Button Name:',
        urlLabel: 'URL:',
        save: 'Speichern',
        cancel: 'Abbrechen',
        
        // Settings Window
        advancedSettings: 'Erweiterte Einstellungen',
        gameElementsSettings: 'Spiel-Elemente Konfiguration',
        showEventNotifications: 'Event-Benachrichtigungen anzeigen',
        showShadowlordNotifications: 'Schattenfürst-Benachrichtigungen anzeigen',
        showGameForgeTaskbar: 'GameForge-Taskbar anzeigen',
        eventNotificationsDesc: 'Zeigt Event-Nachrichten und Ankündigungen im Spiel an',
        shadowlordNotificationsDesc: 'Zeigt Schattenfürst-bezogene Benachrichtigungen an',
        gameForgeTaskbarDesc: 'Zeigt die GameForge-Taskbar am oberen Bildschirmrand an',
        close: 'Schließen',
        resetToDefaults: 'Auf Standard zurücksetzen',
        confirmResetDefaults: 'Alle erweiterten Einstellungen auf Standard zurücksetzen?',
        
        // Notifications
        changesSaved: 'Änderungen gespeichert!',
        menuOrderSaved: 'Menü-Reihenfolge gespeichert!',
        customButtonOrderSaved: 'Custom-Button-Reihenfolge gespeichert!',
        customButtonsSaved: 'Custom Buttons gespeichert!',
        menuSettingsSaved: 'Menü-Einstellungen gespeichert!',
        standardOrderReset: 'Standard-Reihenfolge zurückgesetzt!',
        customOrderReset: 'Custom-Reihenfolge zurückgesetzt!',
        languageChanged: 'Sprache geändert!',
        advancedSettingsSaved: 'Erweiterte Einstellungen gespeichert!',
        settingsReset: 'Einstellungen zurückgesetzt!'
      },
      en: {
        // UI Main Elements
        title: 'BiteFight-Me.Cu.',
        pressF2: 'Press F2',
        
        // Tabs
        tabToggle: 'Toggle',
        tabCustom: 'Custom',
        tabSorting: 'Sorting',
        
        // Tab 1: Toggle
        allOn: 'All On',
        allOff: 'All Off',
        
        // Tab 2: Custom Buttons
        addNewButton: 'Add New Button',
        buttonName: 'Button Name',
        buttonUrl: 'URL (https://...)',
        openInNewTab: 'Open in new tab',
        addButton: 'Add Button',
        manageExistingButtons: 'Manage Existing Buttons',
        noButtonsAvailable: 'No buttons available',
        newTab: 'New Tab',
        sameTab: 'Same Tab',
        editButton: 'Edit Button',
        deleteButton: 'Delete Button',
        confirmDelete: 'Delete button "{0}"?',
        pleaseEnterNameAndUrl: 'Please enter name and URL!',
        
        // Tab 3: Sorting
        menuSorting: 'Menu Sorting',
        sortingDescription: 'Sort standard menu items and custom buttons separately.',
        autoSaveNote: '<strong>Auto-Save:</strong> Changes are automatically saved and the page will reload.',
        upArrow: '↑ = Move up',
        downArrow: '↓ = Move down',
        standardReset: 'Standard Reset',
        customReset: 'Custom Reset',
        sortStandardMenuItems: 'Sort Standard Menu Items',
        sortCustomButtons: 'Sort Custom Buttons',
        noCustomButtonsAvailable: 'No custom buttons available',
        standard: '[Standard]',
        custom: '[Custom]',
        confirmStandardReset: 'Restore standard order?',
        confirmCustomReset: 'Restore custom order?',
        
        // Edit Dialog
        editButtonTitle: 'Edit Button',
        buttonNameLabel: 'Button Name:',
        urlLabel: 'URL:',
        save: 'Save',
        cancel: 'Cancel',
        
        // Settings Window
        advancedSettings: 'Advanced Settings',
        gameElementsSettings: 'Game Elements Configuration',
        showEventNotifications: 'Show Event Notifications',
        showShadowlordNotifications: 'Show Shadowlord Notifications',
        showGameForgeTaskbar: 'Show GameForge Taskbar',
        eventNotificationsDesc: 'Display event messages and announcements in game',
        shadowlordNotificationsDesc: 'Display shadowlord-related notifications',
        gameForgeTaskbarDesc: 'Display GameForge taskbar at top of screen',
        close: 'Close',
        resetToDefaults: 'Reset to Defaults',
        confirmResetDefaults: 'Reset all advanced settings to defaults?',
        
        // Notifications
        changesSaved: 'Changes saved!',
        menuOrderSaved: 'Menu order saved!',
        customButtonOrderSaved: 'Custom button order saved!',
        customButtonsSaved: 'Custom buttons saved!',
        menuSettingsSaved: 'Menu settings saved!',
        standardOrderReset: 'Standard order reset!',
        customOrderReset: 'Custom order reset!',
        languageChanged: 'Language changed!',
        advancedSettingsSaved: 'Advanced settings saved!',
        settingsReset: 'Settings reset!'
      }
    };
  
    // Hilfsfunktion für Übersetzungen mit Platzhaltern
    function t(key, ...args) {
      let translation = translations[currentLanguage][key] || translations['de'][key] || key;
      args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, arg);
      });
      return translation;
    }
  
    // ===== ERWEITERTE EINSTELLUNGEN FUNKTIONALITÄT =====
    function loadAdvancedSettings() {
      try {
        const settings = localStorage.getItem(ADVANCED_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {
          showEventNotifications: true,
          showShadowlordNotifications: true,
          showGameForgeTaskbar: true
        };
      } catch (e) {
        console.error('[BiteFight] Error loading advanced settings:', e);
        return {
          showEventNotifications: true,
          showShadowlordNotifications: true,
          showGameForgeTaskbar: true
        };
      }
    }
  
    function saveAdvancedSettings(settings) {
      try {
        localStorage.setItem(ADVANCED_SETTINGS_KEY, JSON.stringify(settings));
        advancedSettings = settings;
        applyAdvancedSettings();
        saveAndReload(t('advancedSettingsSaved'));
      } catch (e) {
        console.error('[BiteFight] Error saving advanced settings:', e);
      }
    }
  
    function applyAdvancedSettings() {
      // Event-Benachrichtigungen
      const eventElements = document.querySelectorAll('#gameEvent, .game-event, [class*="event"], .event-notification');
      eventElements.forEach(element => {
        if (!advancedSettings.showEventNotifications) {
          element.style.display = 'none';
        } else {
          element.style.display = '';
        }
      });
  
      // Schattenfürst-Benachrichtigungen
      const shadowlordElements = document.querySelectorAll('.shadowlord-notification, [class*="shadowlord"], [class*="shadow-lord"], #shadowlordMsg');
      shadowlordElements.forEach(element => {
        if (!advancedSettings.showShadowlordNotifications) {
          element.style.display = 'none';
        } else {
          element.style.display = '';
        }
      });
  
      // GameForge-Taskbar
      const gameForgeElements = document.querySelectorAll('#mmonetbar, .gameforge-taskbar, [class*="mmonet"], .gf-taskbar');
      gameForgeElements.forEach(element => {
        if (!advancedSettings.showGameForgeTaskbar) {
          element.style.display = 'none';
        } else {
          element.style.display = '';
        }
      });
  
      console.log('[BiteFight] Advanced settings applied:', advancedSettings);
    }
  
    // ===== SPRACH-VERWALTUNG =====
    function loadLanguage() {
      try {
        const language = localStorage.getItem(LANGUAGE_KEY);
        return language || detectBrowserLanguage();
      } catch (e) {
        console.error('[BiteFight] Error loading language:', e);
        return 'de';
      }
    }
  
    function saveLanguage(language) {
      try {
        localStorage.setItem(LANGUAGE_KEY, language);
        currentLanguage = language;
        saveAndReload(t('languageChanged'));
      } catch (e) {
        console.error('[BiteFight] Error saving language:', e);
      }
    }
  
    function detectBrowserLanguage() {
      const browserLang = navigator.language || navigator.userLanguage || 'de';
      if (browserLang.startsWith('en')) {
        return 'en';
      } else if (browserLang.startsWith('de')) {
        return 'de';
      }
      return 'de'; // Default
    }
  
    // ===== SOFORTIGE INITIALISIERUNG =====
    // Lade Einstellungen sofort beim Scriptstart
    currentLanguage = loadLanguage();
    menuSettings = loadMenuSettings();
    customButtons = loadCustomButtons();
    menuOrder = loadMenuOrder();
    customOrder = loadCustomOrder();
    advancedSettings = loadAdvancedSettings();
  
    // Verstecke störende Elemente sofort
    injectHideCSS();
  
    // ===== CSS-INJECTION FÜR SOFORTIGES VERSTECKEN =====
    function injectHideCSS() {
      const hideCSS = `
        /* Verstecke störende Elemente sofort basierend auf Einstellungen */
        ${!advancedSettings.showEventNotifications ? '#gameEvent, .game-event, [class*="event"], .event-notification { display: none !important; }' : ''}
        ${!advancedSettings.showShadowlordNotifications ? '.shadowlord-notification, [class*="shadowlord"], [class*="shadow-lord"], #shadowlordMsg { display: none !important; }' : ''}
        ${!advancedSettings.showGameForgeTaskbar ? '#mmonetbar, .gameforge-taskbar, [class*="mmonet"], .gf-taskbar { display: none !important; }' : ''}
        
        /* Verstecke upgrade message (bleibt immer versteckt) */
        #upgrademsg {
          display: none !important;
        }
        
        /* Verhindere Flash of Unstyled Content */
        #menuHead {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        /* Custom Button Styling - sofort verfügbar mit REDUZIERTEM Abstand */
        .custom-bitefight-btn {
          background: linear-gradient(to bottom, #4a6a22 0%, #3a5a12 50%, #2a4a02 100%) !important;
          background-color: #3a5a12 !important;
          color: #ffe2a6 !important;
          border: 1px solid #5a7a22 !important;
          border-radius: 6px !important;
          padding: 6px 12px !important;
          font-weight: bold !important;
          font-family: 'Trajan Pro', 'Times New Roman', serif !important;
          font-size: 11px !important;
          cursor: pointer !important;
          text-decoration: none !important;
          display: inline-block !important;
          text-align: center !important;
          line-height: 1.2 !important;
          box-sizing: border-box !important;
          transition: all 0.15s ease !important;
          outline: none !important;
          margin: 3px !important;
          min-width: 60px !important;
          min-height: 24px !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.5) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3) !important;
          position: relative !important;
          overflow: hidden !important;
          margin-top: 3px !important; /* REDUZIERT von 6px auf 3px */
        }
        
        /* Flaggen-Buttons Styling */
        .language-flag-btn {
          background: none !important;
          border: 2px solid transparent !important;
          border-radius: 4px !important;
          padding: 4px !important;
          cursor: pointer !important;
          font-size: 16px !important;
          line-height: 1 !important;
          transition: all 0.2s ease !important;
          margin: 0 2px !important;
          display: inline-block !important;
          text-decoration: none !important;
        }
        
        .language-flag-btn:hover {
          border-color: #ffe2a6 !important;
          background: rgba(255, 226, 166, 0.1) !important;
          transform: scale(1.1) !important;
        }
        
        .language-flag-btn.active {
          border-color: #ffe2a6 !important;
          background: rgba(255, 226, 166, 0.2) !important;
          box-shadow: 0 0 8px rgba(255, 226, 166, 0.4) !important;
        }
        
        /* Settings Button Styling */
        .settings-btn {
          background: none !important;
          border: 2px solid transparent !important;
          border-radius: 4px !important;
          padding: 4px 6px !important;
          cursor: pointer !important;
          font-size: 16px !important;
          line-height: 1 !important;
          transition: all 0.2s ease !important;
          margin: 0 2px !important;
          display: inline-block !important;
          text-decoration: none !important;
          color: #ffe2a6 !important;
        }
        
        .settings-btn:hover {
          border-color: #ffe2a6 !important;
          background: rgba(255, 226, 166, 0.1) !important;
          transform: scale(1.1) !important;
        }
      `;
      
      const style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = hideCSS;
      (document.head || document.documentElement).appendChild(style);
      
      console.log('[BiteFight] Hide CSS injected immediately with advanced settings');
    }
  
    // ===== AUTOMATISCHES SPEICHERN UND NEULADEN =====
    function saveAndReload(message = t('changesSaved')) {
      console.log('[BiteFight] Saving and reloading:', message);
      
      // Kurze Bestätigung anzeigen
      showSaveNotification(message);
      
      // Seite nach kurzer Verzögerung neu laden
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  
    function showSaveNotification(message) {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3a5a12;
        color: #ffe2a6;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: bold;
        z-index: 10002;
        border: 1px solid #5a7a22;
        font-family: 'Trajan Pro', 'Times New Roman', serif;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
      `;
      
      notification.textContent = message;
      document.body.appendChild(notification);
      
      // Entferne Notification nach Animation
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 700);
      
      // CSS Animation
      const animationCSS = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      
      const animStyle = document.createElement('style');
      animStyle.textContent = animationCSS;
      document.head.appendChild(animStyle);
    }
  
    // ===== SETTINGS-FENSTER =====
    function createSettingsWindow() {
      if (settingsWindow) {
        // Fenster bereits geöffnet - schließe es
        settingsWindow.parentNode.removeChild(settingsWindow);
        settingsWindow = null;
        return;
      }
  
      settingsWindow = document.createElement('div');
      settingsWindow.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10003;
        font-family: 'Trajan Pro', 'Times New Roman', serif;
      `;
      
      const settingsDialog = document.createElement('div');
      settingsDialog.style.cssText = `
        background: rgba(60, 30, 15, 0.95);
        border: 2px solid #8b4513;
        border-radius: 12px;
        padding: 25px;
        width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        color: #ffe2a6;
      `;
      
      const title = document.createElement('h2');
      title.textContent = t('advancedSettings');
      title.style.cssText = `
        margin: 0 0 20px 0;
        text-align: center;
        color: #ffe2a6;
        font-size: 1.5em;
      `;
      
      const sectionTitle = document.createElement('h3');
      sectionTitle.textContent = t('gameElementsSettings');
      sectionTitle.style.cssText = `
        margin: 0 0 15px 0;
        color: #ffe2a6;
        font-size: 1.2em;
        border-bottom: 1px solid #8b4513;
        padding-bottom: 5px;
      `;
      
      // Event-Benachrichtigungen
      const eventContainer = createSettingControl(
        'showEventNotifications',
        t('showEventNotifications'),
        t('eventNotificationsDesc'),
        advancedSettings.showEventNotifications
      );
      
      // Schattenfürst-Benachrichtigungen
      const shadowlordContainer = createSettingControl(
        'showShadowlordNotifications',
        t('showShadowlordNotifications'),
        t('shadowlordNotificationsDesc'),
        advancedSettings.showShadowlordNotifications
      );
      
      // GameForge-Taskbar
      const gameforgeContainer = createSettingControl(
        'showGameForgeTaskbar',
        t('showGameForgeTaskbar'),
        t('gameForgeTaskbarDesc'),
        advancedSettings.showGameForgeTaskbar
      );
      
      // Buttons Container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: space-between;
        margin-top: 25px;
        padding-top: 15px;
        border-top: 1px solid #8b4513;
      `;
      
      const resetButton = document.createElement('button');
      resetButton.textContent = t('resetToDefaults');
      resetButton.style.cssText = `
        padding: 10px 20px;
        background: #8b1538;
        color: #ffe2a6;
        border: 1px solid #a01a42;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      const closeButton = document.createElement('button');
      closeButton.textContent = t('close');
      closeButton.style.cssText = `
        padding: 10px 20px;
        background: #3a5a12;
        color: #ffe2a6;
        border: 1px solid #5a7a22;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      resetButton.addEventListener('click', () => {
        if (confirm(t('confirmResetDefaults'))) {
          const defaults = {
            showEventNotifications: true,
            showShadowlordNotifications: true,
            showGameForgeTaskbar: true
          };
          saveAdvancedSettings(defaults);
        }
      });
      
      closeButton.addEventListener('click', () => {
        // Sammle alle Einstellungen
        const newSettings = {};
        const checkboxes = settingsDialog.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          newSettings[checkbox.id] = checkbox.checked;
        });
        
        // Speichere nur wenn sich etwas geändert hat
        const changed = Object.keys(newSettings).some(key => 
          newSettings[key] !== advancedSettings[key]
        );
        
        if (changed) {
          saveAdvancedSettings(newSettings);
        } else {
          // Schließe ohne Speichern
          settingsWindow.parentNode.removeChild(settingsWindow);
          settingsWindow = null;
        }
      });
      
      // Escape-Key Handler
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          settingsWindow.parentNode.removeChild(settingsWindow);
          settingsWindow = null;
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      buttonContainer.appendChild(resetButton);
      buttonContainer.appendChild(closeButton);
      
      settingsDialog.appendChild(title);
      settingsDialog.appendChild(sectionTitle);
      settingsDialog.appendChild(eventContainer);
      settingsDialog.appendChild(shadowlordContainer);
      settingsDialog.appendChild(gameforgeContainer);
      settingsDialog.appendChild(buttonContainer);
      
      settingsWindow.appendChild(settingsDialog);
      document.body.appendChild(settingsWindow);
    }
  
    function createSettingControl(id, label, description, checked) {
      const container = document.createElement('div');
      container.style.cssText = `
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(139, 69, 19, 0.2);
        border-radius: 8px;
        border: 1px solid rgba(139, 69, 19, 0.4);
      `;
      
      const labelContainer = document.createElement('div');
      labelContainer.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      `;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = id;
      checkbox.checked = checked;
      checkbox.style.cssText = `
        margin-right: 10px;
        transform: scale(1.2);
      `;
      
      const labelElement = document.createElement('label');
      labelElement.htmlFor = id;
      labelElement.textContent = label;
      labelElement.style.cssText = `
        color: #ffe2a6;
        cursor: pointer;
        font-weight: bold;
        font-size: 1.1em;
      `;
      
      const descElement = document.createElement('div');
      descElement.textContent = description;
      descElement.style.cssText = `
        color: #cccccc;
        font-size: 0.9em;
        margin-left: 32px;
        line-height: 1.4;
      `;
      
      labelContainer.appendChild(checkbox);
      labelContainer.appendChild(labelElement);
      container.appendChild(labelContainer);
      container.appendChild(descElement);
      
      return container;
    }
  
    // ===== HILFSFUNKTIONEN =====
    function isValidBiteFightDomain() {
      return window.location.hostname.includes('bitefight.gameforge.com');
    }
  
    function isValidBiteFightPath() {
      const currentPath = window.location.pathname;
      const validPaths = [
        /^\/profile($|\/.*)/,     // /profile oder /profile/...
        /^\/city($|\/.*)/,        // /city oder /city/...
        /^\/clan($|\/.*)/,        // /clan oder /clan/...
        /^\/hunt($|\/.*)/,        // /hunt oder /hunt/...
        /^\/messages($|\/.*)/,    // /messages oder /messages/...
        /^\/msg($|\/.*)/,         // /msg oder /msg/...
        /^\/report($|\/.*)/,      // /report oder /report/...
        /^\/graveyard($|\/.*)/,   // /graveyard oder /graveyard/...
        /^\/fight($|\/.*)/,       // /fight oder /fight/...
        /^\/admin($|\/.*)/,       // /admin oder /admin/...
        /^\/ranking($|\/.*)/,     // /ranking oder /ranking/...
        /^\/robbery($|\/.*)/,     // /robbery oder /robbery/... (Jagd)
        /^\/hideout($|\/.*)/,     // /hideout oder /hideout/... (Versteck)
        /^\/user($|\/.*)/,        // /user oder /user/... (Einstellungen, etc.)
        /^\/buddy($|\/.*)/,       // /buddy oder /buddy/... (Freundesliste)
        /^\/main($|\/.*)/,        // /main oder /main/... (Neuigkeiten)
        /^\/$/                    // Hauptseite
      ];
      
      return validPaths.some(pattern => pattern.test(currentPath));
    }
  
    // Server und Sprache automatisch erkennen
    function detectServerInfo() {
      const hostname = window.location.hostname;
      const serverMatch = hostname.match(/^(s\d+)-([a-z]{2})\.bitefight\.gameforge\.com$/);
      
      if (serverMatch) {
        return {
          server: serverMatch[1], // z.B. "s64"
          language: serverMatch[2], // z.B. "de"
          fullServer: `${serverMatch[1]}-${serverMatch[2]}` // z.B. "s64-de"
        };
      }
      return null;
    }
  
    // ===== ERWEITERTE MENÜ-SORTIERUNG =====
    function loadMenuOrder() {
      try {
        const order = localStorage.getItem(MENU_ORDER_KEY);
        return order ? JSON.parse(order) : [];
      } catch (e) {
        console.error('[BiteFight] Error loading menu order:', e);
        return [];
      }
    }
  
    function saveMenuOrder(order) {
      try {
        localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(order));
        menuOrder = order;
        saveAndReload(t('menuOrderSaved'));
      } catch (e) {
        console.error('[BiteFight] Error saving menu order:', e);
      }
    }
  
    function loadCustomOrder() {
      try {
        const order = localStorage.getItem(CUSTOM_ORDER_KEY);
        return order ? JSON.parse(order) : [];
      } catch (e) {
        console.error('[BiteFight] Error loading custom order:', e);
        return [];
      }
    }
  
    function saveCustomOrder(order) {
      try {
        localStorage.setItem(CUSTOM_ORDER_KEY, JSON.stringify(order));
        customOrder = order;
        saveAndReload(t('customButtonOrderSaved'));
      } catch (e) {
        console.error('[BiteFight] Error saving custom order:', e);
      }
    }
  
    function extractStandardMenuItems(menu) {
      const items = [];
      const menuItems = menu.querySelectorAll('li');
      
      menuItems.forEach((item, index) => {
        const link = item.querySelector('a');
        // Nur Standard-Items, keine Custom-Items und keine Zeit
        if (link && !item.classList.contains('custom-menu-item') && !item.id?.includes('time')) {
          const isVisible = item.style.display !== 'none';
          const menuKey = `menu-item-${index}`;
          const savedVisibility = menuSettings[menuKey];
          
          items.push({
            element: item,
            text: link.textContent.trim(),
            href: link.href,
            target: link.target,
            isCustom: false,
            originalIndex: index,
            id: `standard-${link.textContent.trim().replace(/\s+/g, '-')}`,
            isVisible: savedVisibility !== undefined ? savedVisibility : isVisible,
            menuKey: menuKey
          });
        }
      });
      
      return items;
    }
  
    function extractCustomMenuItems() {
      return customButtons.map((button, index) => ({
        button: button,
        text: button.name,
        id: `custom-${button.name.replace(/\s+/g, '-')}`,
        index: index
      }));
    }
  
    function applyStandardMenuOrder(menu, items) {
      if (!menu || !items.length) return;
      
      // Finde und behalte spezielle Elemente (wie Zeit und Custom Buttons)
      const timeElement = menu.querySelector('#time, li[id*="time"]');
      const customElements = menu.querySelectorAll('.custom-menu-item');
      
      // Entferne Zeit und Custom Elements temporär
      if (timeElement && timeElement.parentNode) {
        timeElement.parentNode.removeChild(timeElement);
      }
      
      customElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      
      // Entferne alle Standard-Items aus dem Menü
      items.forEach(item => {
        if (item.element.parentNode) {
          item.element.parentNode.removeChild(item.element);
        }
      });
      
      // Sortiere Items basierend auf gespeicherter Reihenfolge
      let sortedItems = [...items];
      
      if (menuOrder.length > 0) {
        sortedItems = [];
        
        // Füge Items in der gespeicherten Reihenfolge hinzu
        menuOrder.forEach(orderId => {
          const item = items.find(i => i.id === orderId);
          if (item) {
            sortedItems.push(item);
          }
        });
        
        // Füge neue Items hinzu, die nicht in der gespeicherten Reihenfolge sind
        items.forEach(item => {
          if (!menuOrder.includes(item.id)) {
            sortedItems.push(item);
          }
        });
      }
      
      // Füge Standard-Items in der neuen Reihenfolge zum Menü hinzu
      sortedItems.forEach((item) => {
        // Wende gespeicherte Sichtbarkeitseinstellungen an
        item.element.style.display = item.isVisible ? 'block' : 'none';
        menu.appendChild(item.element);
      });
      
      // Füge Zeit-Element hinzu
      if (timeElement) {
        menu.appendChild(timeElement);
      }
      
      // Füge Custom Elements NACH der Zeit hinzu
      customElements.forEach(element => {
        menu.appendChild(element);
      });
      
      console.log('[BiteFight] Standard menu order applied with preserved visibility');
    }
  
    function applySortedCustomButtons(menu) {
      if (!menu) return;
      
      // Entferne alle bestehenden Custom-Links
      const existingCustomLinks = menu.querySelectorAll('.custom-menu-item');
      existingCustomLinks.forEach(link => link.remove());
      
      if (customButtons.length === 0) return;
      
      // Sortiere Custom Buttons basierend auf gespeicherter Reihenfolge
      let sortedButtons = [...customButtons];
      
      if (customOrder.length > 0) {
        sortedButtons = [];
        
        customOrder.forEach(orderId => {
          const button = customButtons.find(btn => `custom-${btn.name.replace(/\s+/g, '-')}` === orderId);
          if (button) {
            sortedButtons.push(button);
          }
        });
        
        // Füge neue Buttons hinzu, die nicht in der gespeicherten Reihenfolge sind
        customButtons.forEach(button => {
          const buttonId = `custom-${button.name.replace(/\s+/g, '-')}`;
          if (!customOrder.includes(buttonId)) {
            sortedButtons.push(button);
          }
        });
      }
      
      // Füge Custom-Links am Ende des Menüs hinzu (NACH dem Zeit-Element)
      sortedButtons.forEach((button) => {
        const customLi = createBiteFightMenuLink(button.name, button.url, button.newTab);
        menu.appendChild(customLi);
      });
      
      console.log('[BiteFight] Custom buttons applied with sorting');
    }
  
    // ===== KLONE ORIGINAL BITEFIGHT MENÜ-LINKS =====
    function createBiteFightMenuLink(linkText, url, openInNewTab = false) {
      // Finde ein Original-Menü-Link aus #menuHead
      const originalMenuLinks = document.querySelectorAll('#menuHead li a');
      let referenceLink = null;
      
      // Nimm den ersten verfügbaren Link als Referenz
      if (originalMenuLinks.length > 0) {
        referenceLink = originalMenuLinks[0];
      }
      
      if (referenceLink) {
        // Klone das Original <li> Element komplett
        const originalLi = referenceLink.parentElement;
        const clonedLi = originalLi.cloneNode(true);
        const clonedLink = clonedLi.querySelector('a');
        
        // Passe den geklonten Link an
        clonedLink.textContent = linkText;
        clonedLink.href = url;
        clonedLink.target = openInNewTab ? '_blank' : '_top';
        
        // Entferne Original-Event-Listener und IDs
        clonedLink.removeAttribute('id');
        clonedLi.removeAttribute('id');
        clonedLi.className = 'custom-menu-item';
        
        // Entferne alle Bilder (Premium-Badges etc.)
        const images = clonedLi.querySelectorAll('img');
        images.forEach(img => img.remove());
        
        // REDUZIERTER Abstand: 3px statt 10px
        clonedLi.style.marginTop = '3px';
        
        console.log('[BiteFight] Created menu link:', clonedLi);
        return clonedLi;
      } else {
        // Fallback: Erstelle einen Link im BiteFight-Stil
        const li = document.createElement('li');
        li.className = 'custom-menu-item';
        li.style.cssText = 'display: block; margin-top: 3px;'; // REDUZIERT
        
        const link = document.createElement('a');
        link.href = url;
        link.target = openInNewTab ? '_blank' : '_top';
        link.textContent = linkText;
        link.style.cssText = `
          color: #ffe2a6;
          text-decoration: none;
          display: block;
          padding: 8px 12px;
          font-family: 'Trajan Pro', 'Times New Roman', serif;
          font-weight: bold;
          font-size: 11px;
        `;
        
        li.appendChild(link);
        return li;
      }
    }
  
    // ===== OPTIMIERTE MENÜ-ANWENDUNG =====
    function addCustomLinksToMainMenu(menu) {
      if (!menu) return;
      
      applySortedCustomButtons(menu);
      
      // Wende Standard-Menü-Sortierung an (Custom Buttons bleiben am Ende)
      const standardItems = extractStandardMenuItems(menu);
      applyStandardMenuOrder(menu, standardItems);
      
      // Wende erweiterte Einstellungen an
      applyAdvancedSettings();
      
      // Menü sichtbar machen (entferne das opacity: 0 aus dem CSS)
      menu.style.opacity = '1';
      
      console.log('[BiteFight] Added custom links after time element - menu visible');
    }
  
    // ===== SCHNELLE MENÜ-ERKENNUNG =====
    function waitForMenu(callback) {
      let attempts = 0;
      const maxAttempts = 30; // Reduziert von 60 auf 30
      const checkInterval = 50; // Reduziert von 100ms auf 50ms
      
      const interval = setInterval(() => {
        attempts++;
        
        const menuSelectors = [
          { selector: '#menuHead', priority: 1 },
          { selector: '.menuHead', priority: 1 },
          { selector: '[id*="menu"][id*="Head"]', priority: 2 },
          { selector: '[class*="menu"][class*="head"]', priority: 2 },
          { selector: '#menu', priority: 3 }
        ];
        
        let bestMenu = null;
        let bestPriority = 999;
        
        for (const {selector, priority} of menuSelectors) {
          try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const links = element.querySelectorAll('a');
              const hasValidLinks = links.length >= 1;
              const isVisible = element.offsetHeight > 0 && element.offsetWidth > 0;
              
              if (isVisible && hasValidLinks && priority < bestPriority) {
                bestMenu = element;
                bestPriority = priority;
                console.log(`[BiteFight] Found menu with selector "${selector}":`, element);
              }
            }
          } catch (e) {
            console.log(`[BiteFight] Selector "${selector}" not supported:`, e.message);
          }
        }
        
        if (bestMenu) {
          console.log(`[BiteFight] Menu found after ${attempts} attempts in ${Date.now() - pageLoadStartTime}ms`);
          clearInterval(interval);
          callback(bestMenu);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.warn('[BiteFight] No menu found after optimization, creating fallback menu.');
          clearInterval(interval);
          createFallbackMenu(callback);
        }
      }, checkInterval);
    }
  
    function createFallbackMenu(callback) {
      const fallbackContainer = document.querySelector('body, .content, #content, main, .container');
      if (fallbackContainer) {
        const fallbackMenu = document.createElement('ul');
        fallbackMenu.id = 'fallbackMenu';
        fallbackMenu.style.cssText = `
          list-style: none !important;
          margin: 10px 0 !important;
          padding: 10px !important;
          background: rgba(60, 30, 15, 0.95) !important;
          border-radius: 8px !important;
          display: block !important;
          position: relative !important;
          z-index: 1000 !important;
          opacity: 1 !important;
        `;
        
        const standardLinks = [
          { text: 'Profil', href: '/profile/index' },
          { text: 'Stadt', href: '/city/index' },
          { text: 'Clan', href: '/clan/index' }
        ];
        
        standardLinks.forEach(linkData => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = linkData.href;
          a.textContent = linkData.text;
          a.style.cssText = 'color: #ffe2a6 !important; text-decoration: none !important; display: block !important; padding: 5px !important;';
          li.appendChild(a);
          fallbackMenu.appendChild(li);
        });
        
        fallbackContainer.insertBefore(fallbackMenu, fallbackContainer.firstChild);
        callback(fallbackMenu);
      }
    }
  
    // ===== CUSTOM BUTTONS FUNKTIONALITÄT =====
    function loadCustomButtons() {
      try {
        const buttons = localStorage.getItem(CUSTOM_BUTTONS_KEY);
        return buttons ? JSON.parse(buttons) : [];
      } catch (e) {
        console.error('[BiteFight] Error loading custom buttons:', e);
        return [];
      }
    }
  
    function saveCustomButtons(buttons) {
      try {
        localStorage.setItem(CUSTOM_BUTTONS_KEY, JSON.stringify(buttons));
        customButtons = buttons;
        saveAndReload(t('customButtonsSaved'));
      } catch (e) {
        console.error('[BiteFight] Error saving custom buttons:', e);
      }
    }
  
    // ===== ERWEITERTE BUTTON-BEARBEITUNG =====
    function createEditDialog(button, buttonIndex, callback) {
      // Erstelle Modal Dialog
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        font-family: 'Trajan Pro', 'Times New Roman', serif;
      `;
      
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: rgba(60, 30, 15, 0.95);
        border: 2px solid #8b4513;
        border-radius: 12px;
        padding: 20px;
        width: 400px;
        color: #ffe2a6;
      `;
      
      const title = document.createElement('h3');
      title.textContent = t('editButtonTitle');
      title.style.cssText = `
        margin: 0 0 20px 0;
        text-align: center;
        color: #ffe2a6;
      `;
      
      // Name Input
      const nameLabel = document.createElement('label');
      nameLabel.textContent = t('buttonNameLabel');
      nameLabel.style.cssText = `
        display: block;
        margin-bottom: 5px;
        color: #ffe2a6;
        font-weight: bold;
      `;
      
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = button.name;
      nameInput.style.cssText = `
        width: 100%;
        padding: 8px;
        margin-bottom: 15px;
        background: rgba(139, 69, 19, 0.3);
        border: 1px solid #8b4513;
        border-radius: 4px;
        color: #ffe2a6;
        font-size: 14px;
      `;
      
      // URL Input
      const urlLabel = document.createElement('label');
      urlLabel.textContent = t('urlLabel');
      urlLabel.style.cssText = `
        display: block;
        margin-bottom: 5px;
        color: #ffe2a6;
        font-weight: bold;
      `;
      
      const urlInput = document.createElement('input');
      urlInput.type = 'url';
      urlInput.value = button.url;
      urlInput.style.cssText = `
        width: 100%;
        padding: 8px;
        margin-bottom: 15px;
        background: rgba(139, 69, 19, 0.3);
        border: 1px solid #8b4513;
        border-radius: 4px;
        color: #ffe2a6;
        font-size: 14px;
      `;
      
      // Neuer Tab Checkbox
      const newTabContainer = document.createElement('div');
      newTabContainer.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      `;
      
      const newTabCheckbox = document.createElement('input');
      newTabCheckbox.type = 'checkbox';
      newTabCheckbox.id = 'editNewTabCheckbox';
      newTabCheckbox.checked = button.newTab || false;
      newTabCheckbox.style.marginRight = '8px';
      
      const newTabLabel = document.createElement('label');
      newTabLabel.htmlFor = 'editNewTabCheckbox';
      newTabLabel.textContent = t('openInNewTab');
      newTabLabel.style.cssText = `
        color: #ffe2a6;
        cursor: pointer;
        font-size: 14px;
      `;
      
      newTabContainer.appendChild(newTabCheckbox);
      newTabContainer.appendChild(newTabLabel);
      
      // Buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      `;
      
      const saveButton = document.createElement('button');
      saveButton.textContent = t('save');
      saveButton.style.cssText = `
        padding: 10px 20px;
        background: #3a5a12;
        color: #ffe2a6;
        border: 1px solid #5a7a22;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      const cancelButton = document.createElement('button');
      cancelButton.textContent = t('cancel');
      cancelButton.style.cssText = `
        padding: 10px 20px;
        background: #8b1538;
        color: #ffe2a6;
        border: 1px solid #a01a42;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      saveButton.addEventListener('click', () => {
        const newName = nameInput.value.trim();
        const newUrl = urlInput.value.trim();
        const newTab = newTabCheckbox.checked;
        
        if (newName && newUrl) {
          callback({
            name: newName,
            url: newUrl,
            newTab: newTab
          });
          document.body.removeChild(modal);
        } else {
          alert(t('pleaseEnterNameAndUrl'));
        }
      });
      
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      // Escape-Key Handler
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          document.body.removeChild(modal);
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(saveButton);
      
      dialog.appendChild(title);
      dialog.appendChild(nameLabel);
      dialog.appendChild(nameInput);
      dialog.appendChild(urlLabel);
      dialog.appendChild(urlInput);
      dialog.appendChild(newTabContainer);
      dialog.appendChild(buttonContainer);
      
      modal.appendChild(dialog);
      document.body.appendChild(modal);
      
      // Fokus auf Name Input
      nameInput.focus();
      nameInput.select();
    }
  
    // ===== OVERLAY-FUNKTIONEN =====
    function showOverlay() {
      if (localStorage.getItem(OVERLAY_SEEN_KEY) === 'true') return;
      
      overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.85);
        color: #ffe2a6;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Trajan Pro', 'Times New Roman', serif;
        font-size: 2em;
        text-align: center;
      `;
      
      const message = document.createElement('div');
      message.textContent = t('pressF2');
      message.style.marginBottom = '20px';
      
      const okButton = document.createElement('button');
      okButton.textContent = 'OK';
      okButton.style.cssText = `
        font-size: 1.2em;
        padding: 15px 25px;
        background: #3a5a12;
        color: #ffe2a6;
        border: 1px solid #5a7a22;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      okButton.addEventListener('click', () => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        overlay = null;
        localStorage.setItem(OVERLAY_SEEN_KEY, 'true');
      });
      
      overlay.appendChild(message);
      overlay.appendChild(okButton);
      document.body.appendChild(overlay);
    }
  
    // ===== MENÜ-VERWALTUNG =====
    function loadMenuSettings() {
      try {
        const settings = localStorage.getItem(STORAGE_KEY);
        return settings ? JSON.parse(settings) : {};
      } catch (e) {
        console.error('[BiteFight] Error loading menu settings:', e);
        return {};
      }
    }
  
    function saveMenuSettings(settings) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        menuSettings = settings;
        saveAndReload(t('menuSettingsSaved'));
      } catch (e) {
        console.error('[BiteFight] Error saving menu settings:', e);
      }
    }
  
    function applyMenuSettings(menu, settings) {
      if (!menu || !settings) return;
      
      const menuItems = menu.querySelectorAll('li');
      menuItems.forEach((item, index) => {
        // Skip custom menu items und Zeit-Element
        if (item.classList.contains('custom-menu-item') || item.id?.includes('time')) return;
        
        const setting = settings[`menu-item-${index}`];
        if (setting !== undefined) {
          item.style.display = setting ? 'block' : 'none';
        }
      });
      
      console.log('[BiteFight] Menu settings applied:', settings);
    }
  
    // ===== FLAGGEN-AUSWAHL WIDGET =====
    function createLanguageFlags() {
      const flagContainer = document.createElement('div');
      flagContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 2px;
        margin-left: 10px;
      `;
      
      // Deutsche Flagge
      const germanFlag = document.createElement('button');
      germanFlag.className = `language-flag-btn ${currentLanguage === 'de' ? 'active' : ''}`;
      germanFlag.innerHTML = '🇩🇪';
      germanFlag.title = 'Deutsch';
      germanFlag.addEventListener('click', () => {
        if (currentLanguage !== 'de') {
          saveLanguage('de');
        }
      });
      
      // Englische Flagge
      const englishFlag = document.createElement('button');
      englishFlag.className = `language-flag-btn ${currentLanguage === 'en' ? 'active' : ''}`;
      englishFlag.innerHTML = '🇺🇸';
      englishFlag.title = 'English';
      englishFlag.addEventListener('click', () => {
        if (currentLanguage !== 'en') {
          saveLanguage('en');
        }
      });
      
      flagContainer.appendChild(germanFlag);
      flagContainer.appendChild(englishFlag);
      
      return flagContainer;
    }
  
    // ===== SETTINGS-BUTTON WIDGET =====
    function createSettingsButton() {
      const settingsBtn = document.createElement('button');
      settingsBtn.className = 'settings-btn';
      settingsBtn.innerHTML = '⚙️';
      settingsBtn.title = t('advancedSettings');
      settingsBtn.addEventListener('click', createSettingsWindow);
      
      return settingsBtn;
    }
  
    // ===== TAB-VERWALTUNG =====
    function createTabContent(tabIndex, menu) {
      const content = document.createElement('div');
      content.style.cssText = `
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 15px;
      `;
      
      if (tabIndex === 1) {
        // Tab 1: Menü Ein/Aus
        const menuItems = menu.querySelectorAll('li');
        menuItems.forEach((item, index) => {
          // Skip custom menu items und Zeit-Element
          if (item.classList.contains('custom-menu-item') || item.id?.includes('time')) return;
          
          const link = item.querySelector('a');
          if (!link) return;
          
          const itemContainer = document.createElement('div');
          itemContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding: 5px;
            background: rgba(139, 69, 19, 0.3);
            border-radius: 5px;
          `;
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `menu-item-${index}`;
          checkbox.checked = menuSettings[`menu-item-${index}`] !== false;
          checkbox.style.marginRight = '10px';
          
          const label = document.createElement('label');
          label.htmlFor = `menu-item-${index}`;
          label.textContent = link.textContent.trim() || `Menüpunkt ${index + 1}`;
          label.style.cssText = `
            color: #ffe2a6;
            cursor: pointer;
            flex: 1;
          `;
          
          checkbox.addEventListener('change', () => {
            const newSettings = { ...menuSettings };
            newSettings[`menu-item-${index}`] = checkbox.checked;
            saveMenuSettings(newSettings);
          });
          
          itemContainer.appendChild(checkbox);
          itemContainer.appendChild(label);
          content.appendChild(itemContainer);
        });
        
      } else if (tabIndex === 2) {
        // Tab 2: Custom Buttons hinzufügen/verwalten
        const addButtonSection = document.createElement('div');
        addButtonSection.style.marginBottom = '20px';
        
        const sectionTitle = document.createElement('h4');
        sectionTitle.textContent = t('addNewButton');
        sectionTitle.style.cssText = `
          color: #ffe2a6;
          margin: 0 0 10px 0;
          font-size: 1.1em;
        `;
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = t('buttonName');
        nameInput.style.cssText = `
          width: 70%;
          padding: 8px;
          margin-bottom: 8px;
          background: rgba(139, 69, 19, 0.3);
          border: 1px solid #8b4513;
          border-radius: 4px;
          color: #ffe2a6;
          font-size: 14px;
        `;
        
        const urlInput = document.createElement('input');
        urlInput.type = 'url';
        urlInput.placeholder = t('buttonUrl');
        urlInput.style.cssText = `
          width: 70%;
          padding: 8px;
          margin-bottom: 8px;
          background: rgba(139, 69, 19, 0.3);
          border: 1px solid #8b4513;
          border-radius: 4px;
          color: #ffe2a6;
          font-size: 14px;
        `;
        
        const newTabContainer = document.createElement('div');
        newTabContainer.style.cssText = `
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        `;
        
        const newTabCheckbox = document.createElement('input');
        newTabCheckbox.type = 'checkbox';
        newTabCheckbox.id = 'newTabCheckbox';
        newTabCheckbox.checked = false; // Standardmäßig NICHT in neuem Tab
        newTabCheckbox.style.marginRight = '8px';
        
        const newTabLabel = document.createElement('label');
        newTabLabel.htmlFor = 'newTabCheckbox';
        newTabLabel.textContent = t('openInNewTab');
        newTabLabel.style.cssText = `
          color: #ffe2a6;
          cursor: pointer;
          font-size: 14px;
        `;
        
        newTabContainer.appendChild(newTabCheckbox);
        newTabContainer.appendChild(newTabLabel);
        
        const addButton = document.createElement('button');
        addButton.textContent = t('addButton');
        addButton.style.cssText = `
          width: 100%;
          margin-bottom: 20px;
          padding: 10px;
          background: #3a5a12;
          color: #ffe2a6;
          border: 1px solid #5a7a22;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        `;
        
        addButton.addEventListener('click', () => {
          const name = nameInput.value.trim();
          const url = urlInput.value.trim();
          
          if (name && url) {
            const newButton = {
              name: name,
              url: url,
              newTab: newTabCheckbox.checked
            };
            
            customButtons.push(newButton);
            saveCustomButtons(customButtons);
            
            // Input-Felder leeren
            nameInput.value = '';
            urlInput.value = '';
            newTabCheckbox.checked = false;
            
            // Button-Liste aktualisieren
            updateButtonList();
          } else {
            alert(t('pleaseEnterNameAndUrl'));
          }
        });
        
        addButtonSection.appendChild(sectionTitle);
        addButtonSection.appendChild(nameInput);
        addButtonSection.appendChild(urlInput);
        addButtonSection.appendChild(newTabContainer);
        addButtonSection.appendChild(addButton);
        content.appendChild(addButtonSection);
        
        // Bestehende Buttons verwalten
        const manageSection = document.createElement('div');
        const manageSectionTitle = document.createElement('h4');
        manageSectionTitle.textContent = t('manageExistingButtons');
        manageSectionTitle.style.cssText = `
          color: #ffe2a6;
          margin: 0 0 10px 0;
          font-size: 1.1em;
        `;
        
        const buttonList = document.createElement('div');
        buttonList.id = 'buttonManageList';
        
        function updateButtonList() {
          buttonList.innerHTML = '';
          
          if (customButtons.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = t('noButtonsAvailable');
            emptyMsg.style.cssText = `
              color: #ffe2a6;
              text-align: center;
              font-style: italic;
              padding: 20px;
            `;
            buttonList.appendChild(emptyMsg);
            return;
          }
          
          customButtons.forEach((button, index) => {
            const buttonItem = document.createElement('div');
            buttonItem.style.cssText = `
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 8px;
              margin-bottom: 5px;
              background: rgba(139, 69, 19, 0.3);
              border-radius: 5px;
            `;
            
            const buttonInfo = document.createElement('div');
            buttonInfo.style.flex = '1';
            
            const buttonName = document.createElement('div');
            buttonName.textContent = button.name;
            buttonName.style.cssText = `
              color: #ffe2a6;
              font-weight: bold;
              margin-bottom: 2px;
            `;
            
            const buttonDetails = document.createElement('div');
            buttonDetails.style.cssText = `
              color: #cccccc;
              font-size: 12px;
              word-break: break-all;
            `;
            buttonDetails.innerHTML = `
              <div>${button.url}</div>
              <div style="margin-top: 2px; color: ${button.newTab ? '#90EE90' : '#FFB6C1'};">
                ${button.newTab ? '🗗 ' + t('newTab') : '🗔 ' + t('sameTab')}
              </div>
            `;
            
            buttonInfo.appendChild(buttonName);
            buttonInfo.appendChild(buttonDetails);
            
            const buttonActions = document.createElement('div');
            buttonActions.style.cssText = `
              display: flex;
              gap: 5px;
              margin-left: 10px;
            `;
            
            const editButton = document.createElement('button');
            editButton.textContent = '✎';
            editButton.style.cssText = `
              background: #3a5a12;
              color: white;
              border: none;
              border-radius: 3px;
              width: 25px;
              height: 25px;
              cursor: pointer;
              font-weight: bold;
            `;
            
            editButton.addEventListener('click', () => {
              createEditDialog(button, index, (editedButton) => {
                customButtons[index] = editedButton;
                saveCustomButtons(customButtons);
              });
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '✕';
            deleteButton.style.cssText = `
              background: #8b1538;
              color: white;
              border: none;
              border-radius: 3px;
              width: 25px;
              height: 25px;
              cursor: pointer;
              font-weight: bold;
            `;
            
            deleteButton.addEventListener('click', () => {
              if (confirm(t('confirmDelete', button.name))) {
                customButtons.splice(index, 1);
                saveCustomButtons(customButtons);
              }
            });
            
            buttonActions.appendChild(editButton);
            buttonActions.appendChild(deleteButton);
            buttonItem.appendChild(buttonInfo);
            buttonItem.appendChild(buttonActions);
            buttonList.appendChild(buttonItem);
          });
        }
        
        updateButtonList();
        
        manageSection.appendChild(manageSectionTitle);
        manageSection.appendChild(buttonList);
        content.appendChild(manageSection);
        
      } else if (tabIndex === 3) {
        // Tab 3: Verbesserte Sortierung
        const sortingInfo = document.createElement('div');
        sortingInfo.style.cssText = `
          background: rgba(139, 69, 19, 0.3);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        `;
        
        const infoTitle = document.createElement('h4');
        infoTitle.textContent = t('menuSorting');
        infoTitle.style.cssText = `
          color: #ffe2a6;
          margin: 0 0 10px 0;
          font-size: 1.2em;
        `;
        
        const infoText = document.createElement('div');
        infoText.innerHTML = `
          <p style="color: #ffe2a6; margin-bottom: 10px;">
            ${t('sortingDescription')}
          </p>
          <p style="color: #ffe2a6; margin-bottom: 10px;">
            ${t('autoSaveNote')}
          </p>
          <p style="color: #ffe2a6; margin-bottom: 0;">
            • <strong>${t('upArrow')}</strong> • <strong>${t('downArrow')}</strong>
          </p>
        `;
        
        sortingInfo.appendChild(infoTitle);
        sortingInfo.appendChild(infoText);
        content.appendChild(sortingInfo);
        
        // Reset-Buttons
        const resetContainer = document.createElement('div');
        resetContainer.style.cssText = `
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        `;
        
        const resetStandardButton = document.createElement('button');
        resetStandardButton.textContent = t('standardReset');
        resetStandardButton.style.cssText = `
          flex: 1;
          padding: 8px;
          background: #8b1538;
          color: #ffe2a6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        `;
        
        const resetCustomButton = document.createElement('button');
        resetCustomButton.textContent = t('customReset');
        resetCustomButton.style.cssText = `
          flex: 1;
          padding: 8px;
          background: #8b1538;
          color: #ffe2a6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        `;
        
        resetStandardButton.addEventListener('click', () => {
          if (confirm(t('confirmStandardReset'))) {
            localStorage.removeItem(MENU_ORDER_KEY);
            menuOrder = [];
            saveAndReload(t('standardOrderReset'));
          }
        });
        
        resetCustomButton.addEventListener('click', () => {
          if (confirm(t('confirmCustomReset'))) {
            localStorage.removeItem(CUSTOM_ORDER_KEY);
            customOrder = [];
            saveAndReload(t('customOrderReset'));
          }
        });
        
        resetContainer.appendChild(resetStandardButton);
        resetContainer.appendChild(resetCustomButton);
        content.appendChild(resetContainer);
        
        // Standard-Menü sortieren
        const standardSection = document.createElement('div');
        standardSection.style.marginBottom = '20px';
        
        const standardTitle = document.createElement('h4');
        standardTitle.textContent = t('sortStandardMenuItems');
        standardTitle.style.cssText = `
          color: #ffe2a6;
          margin: 0 0 10px 0;
          font-size: 1.1em;
        `;
        
        const standardList = document.createElement('div');
        standardList.id = 'standardSortList';
        standardList.style.cssText = `
          background: rgba(139, 69, 19, 0.2);
          padding: 10px;
          border-radius: 5px;
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 20px;
        `;
        
        // Custom-Menü sortieren
        const customSection = document.createElement('div');
        
        const customTitle = document.createElement('h4');
        customTitle.textContent = t('sortCustomButtons');
        customTitle.style.cssText = `
          color: #ffe2a6;
          margin: 0 0 10px 0;
          font-size: 1.1em;
        `;
        
        const customList = document.createElement('div');
        customList.id = 'customSortList';
        customList.style.cssText = `
          background: rgba(139, 69, 19, 0.2);
          padding: 10px;
          border-radius: 5px;
          max-height: 200px;
          overflow-y: auto;
        `;
        
        function moveStandardItem(fromIndex, toIndex, items) {
          if (toIndex < 0 || toIndex >= items.length) return;
          
          const movedItem = items.splice(fromIndex, 1)[0];
          items.splice(toIndex, 0, movedItem);
          
          const newOrder = items.map(item => item.id);
          saveMenuOrder(newOrder); // Automatisches Speichern + Reload
        }
        
        function moveCustomItem(fromIndex, toIndex) {
          if (toIndex < 0 || toIndex >= customButtons.length) return;
          
          const movedButton = customButtons.splice(fromIndex, 1)[0];
          customButtons.splice(toIndex, 0, movedButton);
          
          const newOrder = customButtons.map(btn => `custom-${btn.name.replace(/\s+/g, '-')}`);
          saveCustomOrder(newOrder); // Automatisches Speichern + Reload
        }
        
        function updateSortableLists() {
          // Standard-Liste aktualisieren
          standardList.innerHTML = '';
          const standardItems = extractStandardMenuItems(menu);
          
          let sortedStandardItems = [...standardItems];
          if (menuOrder.length > 0) {
            sortedStandardItems = [];
            menuOrder.forEach(orderId => {
              const item = standardItems.find(i => i.id === orderId);
              if (item) sortedStandardItems.push(item);
            });
            standardItems.forEach(item => {
              if (!menuOrder.includes(item.id)) {
                sortedStandardItems.push(item);
              }
            });
          }
          
          sortedStandardItems.forEach((item, index) => {
            const sortItem = createSortableItem(item.text, index, sortedStandardItems.length, 'standard', 
              () => moveStandardItem(index, index - 1, sortedStandardItems),
              () => moveStandardItem(index, index + 1, sortedStandardItems)
            );
            standardList.appendChild(sortItem);
          });
          
          // Custom-Liste aktualisieren
          customList.innerHTML = '';
          if (customButtons.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = t('noCustomButtonsAvailable');
            emptyMsg.style.cssText = `
              color: #ffe2a6;
              text-align: center;
              font-style: italic;
              padding: 20px;
            `;
            customList.appendChild(emptyMsg);
          } else {
            customButtons.forEach((button, index) => {
              const sortItem = createSortableItem(button.name, index, customButtons.length, 'custom',
                () => moveCustomItem(index, index - 1),
                () => moveCustomItem(index, index + 1)
              );
              customList.appendChild(sortItem);
            });
          }
        }
        
        function createSortableItem(text, index, totalCount, type, moveUpCallback, moveDownCallback) {
          const sortItem = document.createElement('div');
          sortItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px;
            margin-bottom: 3px;
            background: rgba(139, 69, 19, 0.3);
            border-radius: 3px;
          `;
          
          const itemInfo = document.createElement('div');
          itemInfo.style.cssText = `
            display: flex;
            align-items: center;
            flex: 1;
          `;
          
          const orderNumber = document.createElement('span');
          orderNumber.textContent = `${index + 1}.`;
          orderNumber.style.cssText = `
            font-weight: bold;
            margin-right: 10px;
            width: 25px;
            color: #ffe2a6;
          `;
          
          const itemName = document.createElement('span');
          itemName.textContent = text;
          itemName.style.cssText = `
            flex: 1;
            color: #ffe2a6;
          `;
          
          const itemType = document.createElement('span');
          itemType.textContent = type === 'standard' ? t('standard') : t('custom');
          itemType.style.cssText = `
            font-size: 10px;
            color: ${type === 'standard' ? '#FFB6C1' : '#90EE90'};
            font-weight: bold;
            margin-right: 10px;
          `;
          
          itemInfo.appendChild(orderNumber);
          itemInfo.appendChild(itemName);
          itemInfo.appendChild(itemType);
          
          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = `
            display: flex;
            gap: 5px;
          `;
          
          const upButton = document.createElement('button');
          upButton.textContent = '↑';
          upButton.style.cssText = `
            background: #3a5a12;
            color: #ffe2a6;
            border: none;
            border-radius: 3px;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-weight: bold;
            ${index === 0 ? 'opacity: 0.3; cursor: not-allowed;' : ''}
          `;
          
          const downButton = document.createElement('button');
          downButton.textContent = '↓';
          downButton.style.cssText = `
            background: #3a5a12;
            color: #ffe2a6;
            border: none;
            border-radius: 3px;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-weight: bold;
            ${index === totalCount - 1 ? 'opacity: 0.3; cursor: not-allowed;' : ''}
          `;
          
          if (index > 0) {
            upButton.addEventListener('click', moveUpCallback);
          }
          
          if (index < totalCount - 1) {
            downButton.addEventListener('click', moveDownCallback);
          }
          
          buttonContainer.appendChild(upButton);
          buttonContainer.appendChild(downButton);
          
          sortItem.appendChild(itemInfo);
          sortItem.appendChild(buttonContainer);
          
          return sortItem;
        }
        
        updateSortableLists();
        
        standardSection.appendChild(standardTitle);
        standardSection.appendChild(standardList);
        customSection.appendChild(customTitle);
        customSection.appendChild(customList);
        
        content.appendChild(standardSection);
        content.appendChild(customSection);
      }
      
      return content;
    }
  
    function createMenuUI(menu) {
      if (uiContainer || !menu) return;
      
      uiContainer = document.createElement('div');
      uiContainer.style.cssText = `
        position: fixed;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        width: 350px;
        background: rgba(60, 30, 15, 0.95);
        border: 2px solid #8b4513;
        border-radius: 12px;
        padding: 15px;
        z-index: 9999;
        font-family: 'Trajan Pro', 'Times New Roman', serif;
        color: #ffe2a6;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
      `;
      
      // HEADER mit Titel, Flaggen-Auswahl und Settings-Button
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
      `;
      
      const title = document.createElement('h3');
      title.textContent = t('title');
      title.style.cssText = `
        margin: 0;
        font-size: 1.4em;
        color: #ffe2a6;
        flex: 1;
      `;
      
      const controlsContainer = document.createElement('div');
      controlsContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
      `;
      
      // Flaggen-Auswahl hinzufügen
      const languageFlags = createLanguageFlags();
      
      // Settings-Button hinzufügen
      const settingsButton = createSettingsButton();
      
      controlsContainer.appendChild(languageFlags);
      controlsContainer.appendChild(settingsButton);
      
      header.appendChild(title);
      header.appendChild(controlsContainer);
      uiContainer.appendChild(header);
      
      // Tab-Navigation
      const tabContainer = document.createElement('div');
      tabContainer.style.cssText = `
        display: flex;
        margin-bottom: 15px;
        background: rgba(139, 69, 19, 0.3);
        border-radius: 6px;
        overflow: hidden;
      `;
      
      const tabs = [
        { id: 1, label: t('tabToggle') },
        { id: 2, label: t('tabCustom') },
        { id: 3, label: t('tabSorting') }
      ];
      
      const tabButtons = {};
      const tabContents = {};
      
      tabs.forEach(tab => {
        const tabButton = document.createElement('button');
        tabButton.textContent = tab.label;
        tabButton.style.cssText = `
          flex: 1;
          padding: 10px;
          border: none;
          background: ${tab.id === activeTab ? '#3a5a12' : 'transparent'};
          color: #ffe2a6;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s ease;
          font-size: 11px;
        `;
        
        tabButton.addEventListener('click', () => {
          activeTab = tab.id;
          // Tab-Buttons aktualisieren
          Object.values(tabButtons).forEach(btn => btn.style.background = 'transparent');
          tabButton.style.background = '#3a5a12';
          
          // Tab-Content aktualisieren
          Object.values(tabContents).forEach(content => content.style.display = 'none');
          tabContents[tab.id].style.display = 'block';
        });
        
        tabButtons[tab.id] = tabButton;
        tabContainer.appendChild(tabButton);
      });
      
      // Tab-Contents erstellen
      const contentContainer = document.createElement('div');
      
      tabs.forEach(tab => {
        const tabContent = createTabContent(tab.id, menu);
        tabContent.style.display = tab.id === activeTab ? 'block' : 'none';
        tabContents[tab.id] = tabContent;
        contentContainer.appendChild(tabContent);
      });
      
      // Control Buttons (nur für Tab 1)
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: space-between;
        margin-top: 15px;
      `;
      
      const allOnBtn = document.createElement('button');
      allOnBtn.textContent = t('allOn');
      allOnBtn.style.cssText = `
        flex: 1;
        padding: 8px;
        background: #3a5a12;
        color: #ffe2a6;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      const allOffBtn = document.createElement('button');
      allOffBtn.textContent = t('allOff');
      allOffBtn.style.cssText = `
        flex: 1;
        padding: 8px;
        background: #8b1538;
        color: #ffe2a6;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      allOnBtn.addEventListener('click', () => {
        if (activeTab === 1) {
          const checkboxes = contentContainer.querySelectorAll('input[type="checkbox"]');
          const newSettings = {};
          checkboxes.forEach((cb, index) => {
            if (cb.id.startsWith('menu-item-')) {
              cb.checked = true;
              newSettings[cb.id] = true;
            }
          });
          saveMenuSettings(newSettings);
        }
      });
      
      allOffBtn.addEventListener('click', () => {
        if (activeTab === 1) {
          const checkboxes = contentContainer.querySelectorAll('input[type="checkbox"]');
          const newSettings = {};
          checkboxes.forEach((cb, index) => {
            if (cb.id.startsWith('menu-item-')) {
              cb.checked = false;
              newSettings[cb.id] = false;
            }
          });
          saveMenuSettings(newSettings);
        }
      });
      
      // Update button container visibility based on active tab
      function updateButtonContainerVisibility() {
        buttonContainer.style.display = activeTab === 1 ? 'flex' : 'none';
      }
      
      // Add tab switch listeners to update button visibility
      Object.values(tabButtons).forEach(btn => {
        btn.addEventListener('click', updateButtonContainerVisibility);
      });
      
      buttonContainer.appendChild(allOnBtn);
      buttonContainer.appendChild(allOffBtn);
      
      uiContainer.appendChild(tabContainer);
      uiContainer.appendChild(contentContainer);
      uiContainer.appendChild(buttonContainer);
      document.body.appendChild(uiContainer);
      
      // Initial visibility
      const savedVisible = localStorage.getItem(UI_VISIBLE_KEY);
      if (savedVisible === 'false') {
        uiContainer.style.display = 'none';
      }
      
      updateButtonContainerVisibility();
      console.log('[BiteFight] Menu UI created with settings window and advanced configuration');
    }
  
    // ===== UI-SICHTBARKEIT =====
    function toggleUIVisibility() {
      if (!uiContainer) return;
      
      const currentlyVisible = uiContainer.style.display !== 'none';
      if (currentlyVisible) {
        uiContainer.style.display = 'none';
        localStorage.setItem(UI_VISIBLE_KEY, 'false');
      } else {
        uiContainer.style.display = 'block';
        localStorage.setItem(UI_VISIBLE_KEY, 'true');
      }
      console.log('[BiteFight] UI visibility toggled:', !currentlyVisible);
    }
  
    // ===== OPTIMIERTE HAUPTINITIALISIERUNG =====
    function initAddon() {
      console.log(`[BiteFight] Fast initialization started at ${Date.now() - pageLoadStartTime}ms`);
      
      // Nur auf gültigen BiteFight-Seiten initialisieren
      if (!isValidBiteFightDomain() || !isValidBiteFightPath()) {
        console.log('[BiteFight] Not a valid BiteFight page, skipping initialization');
        return;
      }
      
      const serverInfo = detectServerInfo();
      console.log('[BiteFight] Server info:', serverInfo);
      
      // Overlay nur auf Hauptseiten anzeigen
      if (window.location.pathname === '/profile/index' || window.location.pathname === '/') {
        showOverlay();
      }
      
      // Optimierte Menü-Erkennung
      waitForMenu(menu => {
        console.log(`[BiteFight] Menu setup completed in ${Date.now() - pageLoadStartTime}ms`);
        
        // Sofortige Menü-Anpassung ohne Verzögerung
        addCustomLinksToMainMenu(menu);
        applyMenuSettings(menu, menuSettings);
        createMenuUI(menu);
        
        console.log('[BiteFight] Addon fully initialized with advanced settings window');
      });
    }
  
    // ===== EVENT LISTENERS =====
    document.addEventListener('keydown', e => {
      if (e.key === 'F2') {
        e.preventDefault();
        toggleUIVisibility();
      }
    });
  
    // ===== SOFORTIGE INITIALISIERUNG =====
    // Verhindere mehrfache Initialisierung
    if (window.bitefightAddonInitialized) {
      console.log('[BiteFight] Addon already initialized');
      return;
    }
    window.bitefightAddonInitialized = true;
  
    // Starte sofort - keine Wartezeit mehr!
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAddon);
    } else {
      // Sofortige Initialisierung ohne setTimeout
      initAddon();
    }
  
    // Zusätzliche Initialisierung für SPA-Navigation
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        console.log('[BiteFight] Page changed to:', url);
        
        // Reset für neue Seite
        buttonsInserted = false;
        if (uiContainer) {
          uiContainer.remove();
          uiContainer = null;
        }
        
        if (settingsWindow) {
          settingsWindow.remove();
          settingsWindow = null;
        }
        
        // Neu initialisieren ohne Verzögerung
        pageLoadStartTime = Date.now();
        initAddon();
      }
    });
    
    urlObserver.observe(document, {subtree: true, childList: true});
  
    console.log('[BiteFight] Addon script loaded with advanced settings configuration');
  
  })();
  