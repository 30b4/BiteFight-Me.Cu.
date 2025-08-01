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
  let currentLanguage = 'de';
  let advancedSettings = {};
  let pageLoadStartTime = Date.now();
  
  // ===== MODAL OBSERVER - LÖSUNG FÜR VERSCHWINDENDE BUTTONS =====
  
  let domObserver = null;
  let modalObserver = null;
  
  function initModalObserver() {
      domObserver = new MutationObserver(function(mutations) {
          let modalDetected = false;
          let modalRemoved = false;
          
          mutations.forEach(function(mutation) {
              mutation.addedNodes.forEach(function(node) {
                  if (node.nodeType === 1) {
                      if (node.id === 'confirmModal' || 
                          node.classList?.contains('modal') ||
                          node.classList?.contains('confirmModal') ||
                          node.querySelector?.('#confirmModal, .modal, .confirmModal')) {
                          modalDetected = true;
                          console.log('[BiteFight] Modal detected - will restore custom buttons');
                      }
                  }
              });
              
              mutation.removedNodes.forEach(function(node) {
                  if (node.nodeType === 1) {
                      if (node.id === 'confirmModal' || 
                          node.classList?.contains('modal') ||
                          node.classList?.contains('confirmModal')) {
                          modalRemoved = true;
                          console.log('[BiteFight] Modal removed - will restore custom buttons');
                      }
                  }
              });
          });
          
          if (modalDetected || modalRemoved) {
              setTimeout(function() {
                  restoreCustomButtonsIfNeeded();
              }, 100);
          }
      });
      
      if (document.body) {
          domObserver.observe(document.body, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['style', 'class']
          });
          console.log('[BiteFight] Modal observer initialized');
      }
  }
  
  function restoreCustomButtonsIfNeeded() {
      const menu = document.querySelector('#menuHead');
      if (!menu) return;
      
      const existingCustomButtons = menu.querySelectorAll('.custom-menu-item');
      const expectedButtonCount = customButtons.filter(btn => btn.enabled !== false).length;
      
      if (existingCustomButtons.length < expectedButtonCount) {
          console.log('[BiteFight] Custom buttons missing, restoring...');
          existingCustomButtons.forEach(btn => btn.remove());
          applySortedCustomButtons(menu);
      }
  }
  
  function initMenuObserver() {
      const menu = document.querySelector('#menuHead');
      if (!menu) return;
      
      modalObserver = new MutationObserver(function(mutations) {
          let customButtonsRemoved = false;
          
          mutations.forEach(function(mutation) {
              mutation.removedNodes.forEach(function(node) {
                  if (node.nodeType === 1 && node.classList?.contains('custom-menu-item')) {
                      customButtonsRemoved = true;
                  }
              });
          });
          
          if (customButtonsRemoved) {
              console.log('[BiteFight] Custom buttons removed from menu - will restore');
              setTimeout(function() {
                  restoreCustomButtonsIfNeeded();
              }, 50);
          }
      });
      
      modalObserver.observe(menu, {
          childList: true,
          subtree: true
      });
      console.log('[BiteFight] Menu observer initialized');
  }
  
  // ===== MEHRSPRACHIGE ÜBERSETZUNGEN =====
  
  const translations = {
      de: {
          title: 'BiteFight-Me.Cu.',
          pressF2: 'Drücke F2',
          tabToggle: 'Standard',
          tabCustom: 'Custom',
          tabSorting: 'Sortierung',
          allOn: 'Alle an',
          allOff: 'Alle aus',
          addNewButton: 'Neuen Button hinzufügen',
          buttonName: 'Button Name',
          buttonUrl: '/city/grotte/ oder URL (https://...)',
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
          menuSorting: 'Menü-Sortierung',
          sortingDescription: 'Sortiere Standard-Menüpunkte und Custom Buttons separat.',
          autoSaveNote: '**Automatisches Speichern:** Änderungen werden automatisch gespeichert und die Seite wird neu geladen.',
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
          editButtonTitle: 'Button bearbeiten',
          buttonNameLabel: 'Button Name:',
          urlLabel: 'URL:',
          save: 'Speichern',
          cancel: 'Abbrechen',
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
          changesSaved: 'Änderungen gespeichert!',
          menuOrderSaved: 'Menü-Reihenfolge gespeichert!',
          customButtonOrderSaved: 'Custom-Button-Reihenfolge gespeichert!',
          customButtonsSaved: 'Custom Buttons gespeichert!',
          toggleCustomButtons: 'Custom Buttons Ein/Aus',
          menuSettingsSaved: 'Menü-Einstellungen gespeichert!',
          standardOrderReset: 'Standard-Reihenfolge zurückgesetzt!',
          customOrderReset: 'Custom-Reihenfolge zurückgesetzt!',
          languageChanged: 'Sprache geändert!',
          advancedSettingsSaved: 'Erweiterte Einstellungen gespeichert!',
          settingsReset: 'Einstellungen zurückgesetzt!',
          information: 'Information'
      },
      en: {
          title: 'BiteFight-Me.Cu.',
          pressF2: 'Press F2',
          tabToggle: 'Standard',
          tabCustom: 'Custom',
          tabSorting: 'Sorting',
          allOn: 'All On',
          allOff: 'All Off',
          addNewButton: 'Add New Button',
          buttonName: 'Button Name',
          buttonUrl: '/city/grotte/ or URL (https://...)',
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
          menuSorting: 'Menu Sorting',
          sortingDescription: 'Sort standard menu items and custom buttons separately.',
          autoSaveNote: '**Auto-Save:** Changes are automatically saved and the page will reload.',
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
          editButtonTitle: 'Edit Button',
          buttonNameLabel: 'Button Name:',
          urlLabel: 'URL:',
          save: 'Save',
          cancel: 'Cancel',
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
          changesSaved: 'Changes saved!',
          menuOrderSaved: 'Menu order saved!',
          customButtonOrderSaved: 'Custom button order saved!',
          customButtonsSaved: 'Custom buttons saved!',
          toggleCustomButtons: 'Toggle Custom Buttons',
          menuSettingsSaved: 'Menu settings saved!',
          standardOrderReset: 'Standard order reset!',
          customOrderReset: 'Custom order reset!',
          languageChanged: 'Language changed!',
          advancedSettingsSaved: 'Advanced settings saved!',
          settingsReset: 'Settings reset!',
          information: 'Information'
      }
  };
  
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
  
      // Schattenfürst-Benachrichtigungen - ERWEITERTE SELEKTOREN
      const shadowlordElements = document.querySelectorAll(`
          .shadowlord-notification, 
          [class*="shadowlord"], 
          [class*="shadow-lord"], 
          [class*="Shadowlord"],
          [class*="Shadow-Lord"],
          #shadowlordMsg,
          #shadowLordMsg,
          .shadowlord,
          .shadow-lord,
          .Shadowlord,
          .Shadow-Lord,
          [id*="shadowlord"],
          [id*="shadow-lord"],
          [id*="Shadowlord"],
          [id*="Shadow-Lord"],
          div[style*="shadowlord"],
          span[style*="shadowlord"]
      `);
      shadowlordElements.forEach(element => {
          if (!advancedSettings.showShadowlordNotifications) {
              element.style.display = 'none !important';
          } else {
              element.style.display = '';
              element.style.removeProperty('display');
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
      return 'de';
  }
  
  // ===== SOFORTIGE INITIALISIERUNG =====
  
  currentLanguage = loadLanguage();
  menuSettings = loadMenuSettings();
  customButtons = loadCustomButtons();
  menuOrder = loadMenuOrder();
  customOrder = loadCustomOrder();
  advancedSettings = loadAdvancedSettings();
  
  injectHideCSS();
  
  // ===== CSS-INJECTION FÜR DÜSTERES DESIGN =====
  
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
        
        /* NEU: Selektive Blur-Effekte und Scroll-Sperrung für Hintergrund */
        body.bitefight-ui-open {
            overflow: hidden !important;
            position: fixed !important;
        }
        
        body.bitefight-ui-open > *:not(.bitefight-ui-overlay):not(#menu) {
            pointer-events: none;
        }
        
        /* KORRIGIERT: Stelle sicher, dass das GESAMTE Menü-Container sichtbar bleibt */
        body.bitefight-ui-open #menu,
        body.bitefight-ui-open #menu *,
        body.bitefight-ui-open #menuHead,
        body.bitefight-ui-open #menuHead li,
        body.bitefight-ui-open #menuHead a,
        body.bitefight-ui-open .custom-menu-item,
        body.bitefight-ui-open .custom-menu-item a,
        body.bitefight-ui-open #time {
            filter: none !important;
            pointer-events: auto !important;
            position: relative !important;
            z-index: 10000 !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        /* Custom Menu Items - Standard BiteFight Design */
        .custom-menu-item {
            /* Kein spezielles Styling - Standard BiteFight Design */
        }
        
        .custom-menu-item a {
            /* Custom Button Links sehen EXAKT wie Standard-Links aus */
        }
        
        /* DÜSTERES UI-DESIGN - Hauptfenster */
        .bitefight-ui {
            background: linear-gradient(135deg, #1a0a0a 0%, #0a0a0a 100%) !important;
            border: 3px solid #5a1a1a !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.9), inset 0 0 20px rgba(90, 26, 26, 0.3) !important;
        }
        
        .bitefight-ui-header {
            background: linear-gradient(90deg, #3a0a0a 0%, #2a0a0a 100%) !important;
            border-bottom: 2px solid #5a1a1a !important;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5) !important;
        }
        
        .bitefight-ui-content {
            background: rgba(26, 10, 10, 0.8) !important;
        }
        
        .bitefight-tab-btn {
            background: #1a0a0a !important;
            color: #cc9999 !important;
            border-right: 1px solid #3a1a1a !important;
            transition: all 0.3s ease !important;
        }
        
        .bitefight-tab-btn.active {
            background: #2a0a0a !important;
            color: #ffcccc !important;
            box-shadow: inset 0 0 10px rgba(90, 26, 26, 0.5) !important;
        }
        
        .bitefight-tab-btn:hover {
            background: #3a1a1a !important;
            color: #ffcccc !important;
        }
        
        /* DÜSTERE BUTTONS */
        .bitefight-btn {
            background: linear-gradient(to bottom, #4a1a1a 0%, #3a0a0a 50%, #2a0a0a 100%) !important;
            color: #ffcccc !important;
            border: 1px solid #5a1a1a !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
            box-shadow: inset 0 1px 0 rgba(255,204,204,0.1), 0 2px 4px rgba(0,0,0,0.5) !important;
        }
        
        .bitefight-btn:hover {
            background: linear-gradient(to bottom, #5a2a2a 0%, #4a1a1a 50%, #3a0a0a 100%) !important;
            border-color: #6a2a2a !important;
            transform: translateY(-1px) !important;
            box-shadow: inset 0 1px 0 rgba(255,204,204,0.2), 0 4px 8px rgba(0,0,0,0.6) !important;
        }
        
        .bitefight-btn-danger {
            background: linear-gradient(to bottom, #5a1a1a 0%, #4a0a0a 50%, #3a0a0a 100%) !important;
            border-color: #7a2a2a !important;
        }
        
        .bitefight-btn-danger:hover {
            background: linear-gradient(to bottom, #6a2a2a 0%, #5a1a1a 50%, #4a0a0a 100%) !important;
            border-color: #8a3a3a !important;
        }
        
        /* DÜSTERE EINGABEFELDER */
        .bitefight-input {
            background: #1a0a0a !important;
            color: #ffcccc !important;
            border: 1px solid #5a1a1a !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important;
        }
        
        .bitefight-input:focus {
            border-color: #7a2a2a !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(122, 42, 42, 0.4) !important;
        }
        
        /* DÜSTERE CONTAINER */
        .bitefight-container {
            background: rgba(26, 10, 10, 0.6) !important;
            border: 1px solid rgba(90, 26, 26, 0.5) !important;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.3) !important;
        }
        
        .bitefight-container:hover {
            background: rgba(42, 16, 16, 0.7) !important;
            border-color: rgba(122, 42, 42, 0.6) !important;
        }
        
        /* Flaggen-Buttons - DÜSTER */
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
            filter: sepia(100%) hue-rotate(320deg) saturate(0.8) !important;
        }
        
        .language-flag-btn:hover {
            border-color: #cc9999 !important;
            background: rgba(204, 153, 153, 0.1) !important;
            transform: scale(1.1) !important;
            filter: sepia(100%) hue-rotate(320deg) saturate(1.2) brightness(1.2) !important;
        }
        
        .language-flag-btn.active {
            border-color: #ffcccc !important;
            background: rgba(255, 204, 204, 0.2) !important;
            box-shadow: 0 0 8px rgba(255, 204, 204, 0.4) !important;
            filter: sepia(100%) hue-rotate(320deg) saturate(1.5) brightness(1.3) !important;
        }
        
        /* Settings Button - DÜSTER */
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
            color: #cc9999 !important;
        }
        
        .settings-btn:hover {
            border-color: #cc9999 !important;
            background: rgba(204, 153, 153, 0.1) !important;
            transform: scale(1.1) rotate(90deg) !important;
            color: #ffcccc !important;
        }
        
        /* Info Button - DÜSTER */
        .info-btn {
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
            color: #cc9999 !important;
        }
        
        .info-btn:hover {
            border-color: #cc9999 !important;
            background: rgba(204, 153, 153, 0.1) !important;
            transform: scale(1.1) !important;
            color: #ffcccc !important;
            text-shadow: 0 0 5px rgba(255, 204, 204, 0.5) !important;
        }
        
        /* FURCHTEINFLÖSSENDE TEXTFARBEN */
        .bitefight-text-primary {
            color: #ffcccc !important;
        }
        
        .bitefight-text-secondary {
            color: #cc9999 !important;
        }
        
        .bitefight-text-danger {
            color: #ff6666 !important;
            text-shadow: 0 0 5px rgba(255, 102, 102, 0.5) !important;
        }
        
        .bitefight-text-warning {
            color: #ffcc66 !important;
        }
      `;

      const style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = hideCSS;
      (document.head || document.documentElement).appendChild(style);
      console.log('[BiteFight] Dark CSS with complete scroll prevention injected');
  }
  
  // ===== AUTOMATISCHES SPEICHERN UND NEULADEN =====
  
  function saveAndReload(message = t('changesSaved')) {
      console.log('[BiteFight] Saving and reloading:', message);
      showSaveNotification(message);
      setTimeout(() => {
          window.location.reload();
      }, 800);
  }
  
  function showSaveNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'bitefight-container';
      notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: bold;
          z-index: 10002;
          font-family: 'Trajan Pro', 'Times New Roman', serif;
          animation: slideIn 0.3s ease;
      `;
      notification.className = 'bitefight-text-primary';
      notification.textContent = message;
      document.body.appendChild(notification);
  
      setTimeout(() => {
          if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
          }
      }, 700);
  
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
          // NEU: Wende die neue Reihenfolge sofort an ohne Reload
          applyMenuOrder();
          showSaveNotification(t('menuOrderSaved'));
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
  
  function loadMenuSettings() {
      try {
          const settings = localStorage.getItem(STORAGE_KEY);
          return settings ? JSON.parse(settings) : {};
      } catch (e) {
          console.error('[BiteFight] Error loading menu settings:', e);
          return {};
      }
  }
  
  function loadCustomButtons() {
      try {
          const buttons = localStorage.getItem(CUSTOM_BUTTONS_KEY);
          const loadedButtons = buttons ? JSON.parse(buttons) : [];
          return loadedButtons.map(button => ({
              ...button,
              enabled: button.enabled !== undefined ? button.enabled : true,
              position: button.position || 'after-time'
          }));
      } catch (e) {
          console.error('[BiteFight] Error loading custom buttons:', e);
          return [];
      }
  }
  
  function saveCustomButtons() {
      try {
          localStorage.setItem(CUSTOM_BUTTONS_KEY, JSON.stringify(customButtons));
          saveAndReload(t('customButtonsSaved'));
      } catch (e) {
          console.error('[BiteFight] Error saving custom buttons:', e);
      }
  }
  
  function applySortedCustomButtons(menu) {
      if (!menu) return;
      
      const existingCustomLinks = menu.querySelectorAll('.custom-menu-item');
      existingCustomLinks.forEach(link => link.remove());
      
      if (customButtons.length === 0) return;
      
      let sortedButtons = [...customButtons];
      if (customOrder.length > 0) {
          sortedButtons = [];
          customOrder.forEach(orderId => {
              const button = customButtons.find(btn => `custom-${btn.name.replace(/\s+/g, '-')}` === orderId);
              if (button) {
                  sortedButtons.push(button);
              }
          });
          
          customButtons.forEach(button => {
              const buttonId = `custom-${button.name.replace(/\s+/g, '-')}`;
              if (!customOrder.includes(buttonId)) {
                  sortedButtons.push(button);
              }
          });
      }
      
      // Nur aktivierte Buttons hinzufügen
      sortedButtons.forEach((button) => {
          if (button.enabled !== false) {
              const customLi = createBiteFightMenuLink(button.name, button.url, button.newTab);
              customLi.classList.add('custom-menu-item');
              
              if (button.position === 'between-standard' && button.insertAfterIndex !== undefined) {
                  const standardButtons = menu.querySelectorAll('li:not(.custom-menu-item):not(#time)');
                  if (standardButtons[button.insertAfterIndex]) {
                      standardButtons[button.insertAfterIndex].parentNode.insertBefore(customLi, standardButtons[button.insertAfterIndex].nextSibling);
                  } else {
                      const timeElement = menu.querySelector('#time');
                      if (timeElement) {
                          timeElement.parentNode.insertBefore(customLi, timeElement.nextSibling);
                      } else {
                          menu.appendChild(customLi);
                      }
                  }
              } else {
                  const timeElement = menu.querySelector('#time');
                  if (timeElement) {
                      timeElement.parentNode.insertBefore(customLi, timeElement.nextSibling);
                  } else {
                      menu.appendChild(customLi);
                  }
              }
          }
      });
      
      console.log('[BiteFight] Custom buttons applied with intelligent positioning');
  }
  
  // ===== KORRIGIERTE SOFORTIGE MENÜ-SORTIERUNG =====
  
  function applyMenuOrder() {
      const menu = document.querySelector('#menuHead');
      if (!menu) return;
      
      if (menuOrder.length === 0) return;
      
      console.log('[BiteFight] Applying menu order:', menuOrder);
      
      // Sammle alle Standard-Menü-Li-Elemente mit stabilen IDs
      const menuItemsMap = new Map();
      const menuLinks = menu.querySelectorAll('li:not(.custom-menu-item):not(#time)');
      
      menuLinks.forEach((li) => {
          const link = li.querySelector('a');
          if (link && link.textContent.trim()) {
              const href = link.getAttribute('href') || '';
              const stableId = href ? `menu-${href.replace(/[^a-zA-Z0-9]/g, '-')}` : `menu-text-${link.textContent.trim().replace(/[^a-zA-Z0-9]/g, '-')}`;
              menuItemsMap.set(stableId, li);
          }
      });
      
      // Sammle Custom Buttons und Zeit-Element
      const customButtons = menu.querySelectorAll('.custom-menu-item');
      const timeElement = menu.querySelector('#time');
      
      // Leere das Menü
      menu.innerHTML = '';
      
      // Füge Standard-Elemente in neuer Reihenfolge hinzu
      menuOrder.forEach(orderId => {
          const element = menuItemsMap.get(orderId);
          if (element) {
              menu.appendChild(element);
          }
      });
      
      // Füge nicht-sortierte Elemente hinzu
      menuItemsMap.forEach((element, id) => {
          if (!menuOrder.includes(id)) {
              menu.appendChild(element);
          }
      });
      
      // Füge Zeit-Element hinzu
      if (timeElement) {
          menu.appendChild(timeElement);
      }
      
      // Füge Custom Buttons nach der Zeit hinzu
      customButtons.forEach(button => {
          menu.appendChild(button);
      });
      
      console.log('[BiteFight] Menu order applied successfully');
  }
  
  function createBiteFightMenuLink(linkText, url, openInNewTab = false) {
      const originalMenuLinks = document.querySelectorAll('#menuHead li');
      let referenceLink = null;
      
      for (let i = 0; i < originalMenuLinks.length; i++) {
          if (!originalMenuLinks[i].classList.contains('custom-menu-item')) {
              referenceLink = originalMenuLinks[i];
              break;
          }
      }
  
      if (referenceLink) {
          const customLi = referenceLink.cloneNode(true);
          customLi.innerHTML = '';
          
          const customLink = document.createElement('a');
          customLink.textContent = linkText;
          customLink.href = url;
          customLink.target = openInNewTab ? '_blank' : '_self';
          
          const originalLink = referenceLink.querySelector('a');
          if (originalLink) {
              customLink.className = originalLink.className;
          }
          
          customLi.classList.add('custom-menu-item');
          customLi.appendChild(customLink);
          
          console.log('[BiteFight] Custom button created:', linkText);
          return customLi;
      } else {
          const customLi = document.createElement('li');
          customLi.classList.add('custom-menu-item');
          
          const customLink = document.createElement('a');
          customLink.textContent = linkText;
          customLink.href = url;
          customLink.target = openInNewTab ? '_blank' : '_self';
          
          const existingMenuLink = document.querySelector('#menuHead li:not(.custom-menu-item) a');
          if (existingMenuLink) {
              customLink.className = existingMenuLink.className;
          }
          
          customLi.appendChild(customLink);
          
          console.log('[BiteFight] Custom button created (fallback):', linkText);
          return customLi;
      }
  }
  
  // ===== KORRIGIERTE getMenuItems FUNKTION MIT STABILEN IDs =====
  function getMenuItems() {
      const items = [];
      const menu = document.querySelector('#menuHead');
      if (!menu) return items;
      
      const menuLinks = document.querySelectorAll('#menuHead li:not(.custom-menu-item):not(#time)');
      menuLinks.forEach((li, index) => {
          const link = li.querySelector('a');
          if (link && link.textContent.trim()) {
              // KORRIGIERT: Verwende URL oder Text als stabile ID
              const href = link.getAttribute('href') || '';
              const stableId = href ? `menu-${href.replace(/[^a-zA-Z0-9]/g, '-')}` : `menu-text-${link.textContent.trim().replace(/[^a-zA-Z0-9]/g, '-')}`;
              
              items.push({
                  id: stableId,
                  text: link.textContent.trim(),
                  element: link,
                  liElement: li,
                  href: href,
                  isCustom: false
              });
          }
      });
      
      console.log('[BiteFight] Found standard menu items:', items.map(item => `${item.text} (${item.id})`));
      return items;
  }
  
  // ===== MENÜ-ELEMENTE VERSTECKEN/ANZEIGEN =====
  
  function applyMenuSettings() {
      const menu = document.querySelector('#menuHead');
      if (!menu) return;
      
      const menuItems = getMenuItems();
      
      menuItems.forEach(item => {
          const isVisible = menuSettings[item.id] !== false;
          if (item.element && item.element.closest) {
              const li = item.element.closest('li');
              if (li) {
                  li.style.display = isVisible ? '' : 'none';
              }
          }
      });
      
      console.log('[BiteFight] Menu settings applied');
  }
  
  function applyCustomButtonSettings() {
      const menu = document.querySelector('#menuHead');
      if (!menu) return;
      
      const customMenuItems = menu.querySelectorAll('.custom-menu-item');
      
      customMenuItems.forEach((menuItem, index) => {
          if (customButtons[index]) {
              const isVisible = customButtons[index].enabled !== false;
              menuItem.style.display = isVisible ? '' : 'none';
          }
      });
      
      console.log('[BiteFight] Custom button settings applied');
  }
  
  // ===== UI-FUNKTIONEN =====

  function createSettingsUI() {
    // Erstelle Hintergrund-Overlay das nur den Inhalt verschwimmt, nicht das Menü
    const overlay = document.createElement('div');
    overlay.className = 'bitefight-ui-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    `;
    
    const ui = document.createElement('div');
    ui.className = 'bitefight-ui';
      ui.style.cssText = `
          position: relative;
          font-family: 'Trajan Pro', 'Times New Roman', serif;
          width: 580px;
          max-height: 80vh;
          overflow: hidden;
          backdrop-filter: blur(50px);
          z-index: 1;
      `;

      ui.innerHTML = `
          <div class="bitefight-ui-header" style="padding: 15px; border-radius: 8px 8px 0 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h2 style="margin: 0; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" class="bitefight-text-primary">
                      🦇 ${t('title')}
                  </h2>
                  <div style="display: flex; align-items: center; gap: 10px;">
                      <span class="language-flag-btn ${currentLanguage === 'de' ? 'active' : ''}" data-lang="de">🇩🇪</span>
                      <span class="language-flag-btn ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">🇺🇸</span>
                      <span class="info-btn" data-action="show-info" title="Informationen">ℹ️</span>
                      <span class="settings-btn" data-action="advanced-settings">⚙️</span>
                      <span style="cursor: pointer; font-size: 24px; line-height: 1;" class="bitefight-text-danger" data-action="close">×</span>
                  </div>
              </div>
          </div>
          <div class="bitefight-ui-content" style="padding: 0; max-height: calc(80vh - 80px); overflow-y: auto;">
              <div style="display: flex;">
                  <button class="bitefight-tab-btn" data-tab="1" style="flex: 1; padding: 12px; border: none; cursor: pointer; font-family: inherit;">${t('tabToggle')}</button>
                  <button class="bitefight-tab-btn active" data-tab="2" style="flex: 1; padding: 12px; border: none; cursor: pointer; font-family: inherit;">${t('tabCustom')}</button>
                  <button class="bitefight-tab-btn" data-tab="3" style="flex: 1; padding: 12px; border: none; cursor: pointer; font-family: inherit;">${t('tabSorting')}</button>
              </div>
              <div class="tab-content" id="tab1" style="display: none; padding: 20px;">
                  ${createToggleTabContent()}
              </div>
              <div class="tab-content" id="tab2" style="display: block; padding: 20px;">
                  ${createCustomTabContent()}
              </div>
              <div class="tab-content" id="tab3" style="display: none; padding: 20px;">
                  ${createSortingTabContent()}
              </div>
          </div>
      `;

      // Füge UI zum Overlay hinzu
      overlay.appendChild(ui);

      // Event Listeners
      const tabBtns = ui.querySelectorAll('.bitefight-tab-btn');
      tabBtns.forEach(btn => {
          btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab, ui));
      });

      const langBtns = ui.querySelectorAll('.language-flag-btn');
      langBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
              const lang = e.target.dataset.lang;
              if (lang !== currentLanguage) {
                  saveLanguage(lang);
              }
          });
      });

      // Schließe UI beim Klick auf Overlay (außerhalb der UI)
      overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
              closeUI();
          }
      });

      ui.addEventListener('click', (e) => {
          if (e.target.dataset.action === 'close') {
              closeUI();
          } else if (e.target.dataset.action === 'advanced-settings') {
              openAdvancedSettings();
          } else if (e.target.dataset.action === 'show-info') {
              showInfoDialog();
          }
      });

      return overlay;
  }
  
  function showInfoDialog() {
    // Erstelle Information Dialog mit Overlay und Blur-Effekt
    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'bitefight-ui-overlay info-dialog';
    infoOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10003;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        font-family: 'Trajan Pro', 'Times New Roman', serif;
    `;
    
    const dialog = document.createElement('div');
    dialog.className = 'bitefight-ui';
    dialog.style.cssText = `
        position: relative;
        z-index: 1;
        padding: 25px;
        max-width: 500px;
        margin: 20px;
        border-radius: 12px;
        overflow: hidden;
        backdrop-filter: blur(10px);
    `;
    
    dialog.innerHTML = `
        <h3 style="margin: 0 0 20px 0; text-align: center; font-size: 18px;" class="bitefight-text-danger">
            💀 Information
        </h3>
        <div style="line-height: 1.6; font-size: 13px; margin-bottom: 20px;" class="bitefight-text-secondary">
            <p style="margin: 0 0 15px 0;">
                <strong class="bitefight-text-primary">Rechtlicher Hinweis:</strong><br>
                Alle in diesem Script verwendeten Grafiken und visuellen Elemente sind Eigentum von GameForge und werden nur temporär clientseitig angezeigt.
            </p>
            <p style="margin: 0 0 15px 0;">
                <strong class="bitefight-text-primary">Technische Information:</strong><br>
                Dieses Script führt ausschließlich clientseitige Änderungen durch und gewährt dem Spieler keinen unfairen Vorteil. Es werden keine serverseitigen Daten verändert oder manipuliert.
            </p>
            <p style="margin: 0;">
                <strong class="bitefight-text-primary">Verwendungszweck:</strong><br>
                Das Script dient ausschließlich der Verbesserung der Benutzerfreundlichkeit und Personalisierung der Spieloberfläche.
            </p>
        </div>
        <div style="text-align: center;">
            <button data-action="close-info" class="bitefight-btn" style="
                padding: 12px 24px; 
                cursor: pointer; 
                font-family: inherit; 
                font-weight: bold;
                font-size: 14px;
                border-radius: 6px;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            ">🗡️ Verstanden</button>
        </div>
      `;
      
      // Füge Dialog zum Overlay hinzu
      infoOverlay.appendChild(dialog);
      
      // Füge Overlay zum Body hinzu
      document.body.appendChild(infoOverlay);
      
      // Schließe Dialog beim Klick auf Overlay (außerhalb des Dialogs)
      infoOverlay.addEventListener('click', (e) => {
          if (e.target === infoOverlay) {
              infoOverlay.remove();
          }
      });
      
      // Schließe Dialog beim Klick auf Button
      dialog.addEventListener('click', (e) => {
          if (e.target.dataset.action === 'close-info') {
              infoOverlay.remove();
          }
      });
      
      console.log('[BiteFight] Info dialog opened with blur and scroll prevention');
  }
  
  function createToggleTabContent() {
      return `
          <div style="text-align: center; margin-bottom: 20px;">
              <button id="allOnBtn" class="bitefight-btn" style="
                  padding: 12px 20px; 
                  margin: 5px; 
                  cursor: pointer; 
                  font-family: inherit; 
                  font-weight: bold;
                  border-radius: 6px;
                  transition: all 0.3s ease;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              ">⚡ ${t('allOn')}</button>
              <button id="allOffBtn" class="bitefight-btn-danger" style="
                  padding: 12px 20px; 
                  margin: 5px; 
                  cursor: pointer; 
                  font-family: inherit; 
                  font-weight: bold;
                  border-radius: 6px;
                  transition: all 0.3s ease;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              ">💀 ${t('allOff')}</button>
          </div>
          <div id="menuToggleContainer" class="bitefight-container" style="
              border-radius: 8px; 
              padding: 15px;
              margin-top: 10px;
          "></div>
      `;
  }
  
  function createCustomTabContent() {
      return `
          <div class="bitefight-container" style="padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 15px 0;" class="bitefight-text-primary">${t('addNewButton')}</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <input type="text" id="customButtonName" placeholder="${t('buttonName')}" class="bitefight-input" style="padding: 8px; border-radius: 4px; font-family: inherit;">
                  <input type="text" id="customButtonUrl" placeholder="${t('buttonUrl')}" class="bitefight-input" style="padding: 8px; border-radius: 4px; font-family: inherit;">
              </div>
              <div style="margin-bottom: 10px;">
                  <label style="display: flex; align-items: center; gap: 8px;" class="bitefight-text-primary">
                      <input type="checkbox" id="customButtonNewTab" style="accent-color: #5a1a1a;">
                      ${t('openInNewTab')}
                  </label>
              </div>
              <div style="margin-bottom: 10px;">
                  <label style="display: block; margin-bottom: 5px;" class="bitefight-text-primary">Position:</label>
                  <select id="customButtonPosition" class="bitefight-input" style="padding: 8px; border-radius: 4px; font-family: inherit; width: 100%;">
                      <option value="after-time">Nach Uhrzeit (Standard)</option>
                      <option value="between-standard">Zwischen Standard-Menü</option>
                  </select>
              </div>
              <button id="addCustomButton" class="bitefight-btn" style="padding: 8px 16px; border-radius: 6px; cursor: pointer; font-family: inherit; width: 100%;">${t('addButton')}</button>
          </div>
          
          <div class="bitefight-container" style="padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 15px 0;" class="bitefight-text-primary">${t('toggleCustomButtons')}</h3>
              <div id="customButtonToggleContainer"></div>
          </div>
          
          <div>
              <h3 style="margin: 0 0 15px 0;" class="bitefight-text-primary">${t('manageExistingButtons')}</h3>
              <div id="customButtonsList"></div>
          </div>
      `;
  }
  
  function createSortingTabContent() {
      return `
          <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0;" class="bitefight-text-primary">${t('menuSorting')}</h3>
              <p style="margin: 0 0 15px 0; font-size: 12px;" class="bitefight-text-secondary">${t('sortingDescription')}</p>
              <div class="bitefight-container" style="padding: 10px; border-radius: 6px; margin-bottom: 15px;">
                  <p style="margin: 0; font-size: 11px; font-weight: bold;" class="bitefight-text-warning">${t('autoSaveNote')}</p>
              </div>
              <div style="display: flex; gap: 10px; margin-bottom: 15px; font-size: 11px;" class="bitefight-text-secondary">
                  <span>${t('upArrow')}</span>
                  <span>${t('downArrow')}</span>
              </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <h4 style="margin: 0;" class="bitefight-text-primary">${t('sortStandardMenuItems')}</h4>
                      <button id="resetStandardOrder" class="bitefight-btn-danger" style="padding: 4px 8px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 10px;">${t('standardReset')}</button>
                  </div>
                  <div id="standardMenuSorting" class="bitefight-container" style="border-radius: 6px; padding: 10px; max-height: 200px; overflow-y: auto;"></div>
              </div>
              
              <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <h4 style="margin: 0;" class="bitefight-text-primary">${t('sortCustomButtons')}</h4>
                      <button id="resetCustomOrder" class="bitefight-btn-danger" style="padding: 4px 8px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 10px;">${t('customReset')}</button>
                  </div>
                  <div id="customButtonSorting" class="bitefight-container" style="border-radius: 6px; padding: 10px; max-height: 200px; overflow-y: auto;"></div>
              </div>
          </div>
      `;
  }

  // ===== KORRIGIERTE ERWEITERTE EINSTELLUNGEN UI =====

  function openAdvancedSettings() {
    // Verstecke das Hauptfenster
    if (uiContainer) {
        uiContainer.style.display = 'none';
    }
    
    // Erstelle Advanced Settings mit Overlay und Blur-Effekt
    const advancedOverlay = document.createElement('div');
    advancedOverlay.className = 'bitefight-ui-overlay';
    advancedOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    `;
    
    const settingsUI = document.createElement('div');
    settingsUI.className = 'bitefight-ui';
    settingsUI.style.cssText = `
        position: relative;
        z-index: 1;
        font-family: 'Trajan Pro', 'Times New Roman', serif;
        width: 550px;
        max-height: 80vh;
        overflow: hidden;
        backdrop-filter: blur(10px);
    `;

    settingsUI.innerHTML = `
        <div class="bitefight-ui-header" style="padding: 15px; border-radius: 8px 8px 0 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" class="bitefight-text-primary">
                    ⚙️ ${t('advancedSettings')}
                </h2>
                <span style="cursor: pointer; font-size: 24px; line-height: 1;" class="bitefight-text-danger" data-action="close-advanced">×</span>
            </div>
        </div>
        
        <div style="padding: 0; max-height: calc(80vh - 80px); overflow-y: auto;">
            <div style="padding: 20px 25px 0 25px;">
                <h3 style="margin: 0 0 20px 0; font-size: 16px; text-align: center; border-bottom: 2px solid #5a1a1a; padding-bottom: 10px;" class="bitefight-text-primary">
                    ${t('gameElementsSettings')}
                </h3>
            </div>
            
            <div style="padding: 0 25px 20px 25px;">
                <div class="bitefight-container" style="border-radius: 8px; margin-bottom: 12px; overflow: hidden;">
                    <label style="display: flex; align-items: flex-start; gap: 15px; padding: 18px; cursor: pointer; transition: background 0.2s ease;" 
                           onmouseover="this.style.background='rgba(42, 16, 16, 0.7)'" 
                           onmouseout="this.style.background=''">
                        <input type="checkbox" id="showEventNotifications" ${advancedSettings.showEventNotifications ? 'checked' : ''} 
                               style="accent-color: #5a1a1a; margin-top: 2px; transform: scale(1.3); cursor: pointer;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;" class="bitefight-text-primary">
                                ${t('showEventNotifications')}
                            </div>
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; opacity: 0.9;" class="bitefight-text-secondary">
                                ${t('eventNotificationsDesc')}
                            </p>
                        </div>
                    </label>
                </div>
                
                <div class="bitefight-container" style="border-radius: 8px; margin-bottom: 12px; overflow: hidden;">
                    <label style="display: flex; align-items: flex-start; gap: 15px; padding: 18px; cursor: pointer; transition: background 0.2s ease;" 
                           onmouseover="this.style.background='rgba(42, 16, 16, 0.7)'" 
                           onmouseout="this.style.background=''">
                        <input type="checkbox" id="showShadowlordNotifications" ${advancedSettings.showShadowlordNotifications ? 'checked' : ''} 
                               style="accent-color: #5a1a1a; margin-top: 2px; transform: scale(1.3); cursor: pointer;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;" class="bitefight-text-primary">
                                ${t('showShadowlordNotifications')}
                            </div>
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; opacity: 0.9;" class="bitefight-text-secondary">
                                ${t('shadowlordNotificationsDesc')}
                            </p>
                        </div>
                    </label>
                </div>
                
                <div class="bitefight-container" style="border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
                    <label style="display: flex; align-items: flex-start; gap: 15px; padding: 18px; cursor: pointer; transition: background 0.2s ease;" 
                           onmouseover="this.style.background='rgba(42, 16, 16, 0.7)'" 
                           onmouseout="this.style.background=''">
                        <input type="checkbox" id="showGameForgeTaskbar" ${advancedSettings.showGameForgeTaskbar ? 'checked' : ''} 
                               style="accent-color: #5a1a1a; margin-top: 2px; transform: scale(1.3); cursor: pointer;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;" class="bitefight-text-primary">
                                ${t('showGameForgeTaskbar')}
                            </div>
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; opacity: 0.9;" class="bitefight-text-secondary">
                                ${t('gameForgeTaskbarDesc')}
                            </p>
                        </div>
                    </label>
                </div>
            </div>
            
            <div style="background: rgba(26, 10, 10, 0.3); border-top: 2px solid #5a1a1a; padding: 20px 25px;">
                <div style="display: flex; flex-direction: column; gap: 12px; align-items: stretch;">
                    <button id="saveAdvancedSettings" class="bitefight-btn" style="
                        padding: 14px 20px; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-family: inherit; 
                        font-weight: bold; 
                        font-size: 14px;
                        transition: all 0.15s ease;
                        text-align: center;
                        letter-spacing: 0.5px;
                    ">${t('save')}</button>
                    
                    <button id="resetAdvancedSettings" class="bitefight-btn-danger" style="
                        padding: 14px 20px; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-family: inherit; 
                        font-weight: bold; 
                        font-size: 14px;
                        transition: all 0.15s ease;
                        text-align: center;
                        letter-spacing: 0.5px;
                    ">${t('resetToDefaults')}</button>
                    
                    <button data-action="close-advanced" class="bitefight-btn" style="
                        padding: 14px 20px; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-family: inherit; 
                        font-weight: bold; 
                        font-size: 14px;
                        transition: all 0.15s ease;
                        text-align: center;
                        letter-spacing: 0.5px;
                        background: linear-gradient(to bottom, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%) !important;
                        border-color: #5a5a5a !important;
                    ">${t('close')}</button>
                </div>
            </div>
        </div>
    `;

    // Füge Settings UI zum Overlay hinzu
    advancedOverlay.appendChild(settingsUI);
    
    // Füge Overlay zum Body hinzu
    document.body.appendChild(advancedOverlay);
    settingsWindow = advancedOverlay; // Speichere das Overlay, nicht nur die Settings UI

    // Event Listeners
    const saveBtn = settingsUI.querySelector('#saveAdvancedSettings');
    const resetBtn = settingsUI.querySelector('#resetAdvancedSettings');

    saveBtn.addEventListener('click', () => {
        const newSettings = {
            showEventNotifications: settingsUI.querySelector('#showEventNotifications').checked,
            showShadowlordNotifications: settingsUI.querySelector('#showShadowlordNotifications').checked,
            showGameForgeTaskbar: settingsUI.querySelector('#showGameForgeTaskbar').checked
        };
        saveAdvancedSettings(newSettings);
    });

    resetBtn.addEventListener('click', () => {
        if (confirm(t('confirmResetDefaults'))) {
            const defaultSettings = {
                showEventNotifications: true,
                showShadowlordNotifications: true,
                showGameForgeTaskbar: true
            };
            saveAdvancedSettings(defaultSettings);
        }
    });

    // Schließe Advanced Settings beim Klick auf Overlay (außerhalb der Settings UI)
    advancedOverlay.addEventListener('click', (e) => {
        if (e.target === advancedOverlay) {
            closeAdvancedSettings();
        }
    });

    // KORRIGIERT: Schließe nur Advanced Settings, zeige Hauptfenster wieder an
    settingsUI.addEventListener('click', (e) => {
        if (e.target.dataset.action === 'close-advanced') {
            closeAdvancedSettings();
        }
    });
    
    console.log('[BiteFight] Advanced Settings opened with blur and scroll prevention');
  }

  // Neue Funktion zum korrekten Schließen der Advanced Settings
  function closeAdvancedSettings() {
      if (settingsWindow && settingsWindow.parentNode) {
          settingsWindow.parentNode.removeChild(settingsWindow);
          settingsWindow = null;
      }
      
      // Zeige das Hauptfenster wieder an
      if (uiContainer) {
          uiContainer.style.display = 'flex'; // 'flex' weil es ein Overlay mit Flexbox ist
      }
      
      console.log('[BiteFight] Advanced Settings closed, main UI restored');
  }
  
  // ===== TAB-FUNKTIONALITÄT =====
  
  function switchTab(tabNum, ui) {
      activeTab = parseInt(tabNum);
      
      const tabBtns = ui.querySelectorAll('.bitefight-tab-btn');
      tabBtns.forEach(btn => {
          if (btn.dataset.tab === tabNum) {
              btn.classList.add('active');
          } else {
              btn.classList.remove('active');
          }
      });
      
      const tabContents = ui.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
          content.style.display = content.id === `tab${tabNum}` ? 'block' : 'none';
      });
      
      if (tabNum === '1') {
          populateToggleTab(ui);
      } else if (tabNum === '2') {
          populateCustomTab(ui);
      } else if (tabNum === '3') {
          populateSortingTab(ui);
      }
  }
  
  function populateToggleTab(ui) {
      const container = ui.querySelector('#menuToggleContainer');
      if (!container) return;
  
      const menuItems = getMenuItems();
      
      let html = '';
      menuItems.forEach(item => {
          const isChecked = menuSettings[item.id] !== false;
          html += `
              <div class="bitefight-container" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 5px 0; border-radius: 6px;">
                  <span class="bitefight-text-primary">${item.text}</span>
                  <label style="display: flex; align-items: center; gap: 8px;">
                      <input type="checkbox" ${isChecked ? 'checked' : ''} data-menu-id="${item.id}" style="accent-color: #5a1a1a;">
                  </label>
              </div>
          `;
      });
      
      container.innerHTML = html;
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', (e) => {
              const menuId = e.target.dataset.menuId;
              menuSettings[menuId] = e.target.checked;
              applyMenuSettings();
              try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(menuSettings));
                  console.log('[BiteFight] Menu settings saved:', menuSettings);
              } catch (error) {
                  console.error('[BiteFight] Error saving menu settings:', error);
              }
          });
      });
      
      const allOnBtn = ui.querySelector('#allOnBtn');
      const allOffBtn = ui.querySelector('#allOffBtn');
      
      allOnBtn.addEventListener('click', () => {
          checkboxes.forEach(cb => {
              cb.checked = true;
              menuSettings[cb.dataset.menuId] = true;
          });
          applyMenuSettings();
          try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(menuSettings));
              console.log('[BiteFight] All menu items enabled');
          } catch (error) {
              console.error('[BiteFight] Error saving menu settings:', error);
          }
      });
      
      allOffBtn.addEventListener('click', () => {
          checkboxes.forEach(cb => {
              cb.checked = false;
              menuSettings[cb.dataset.menuId] = false;
          });
          applyMenuSettings();
          try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(menuSettings));
              console.log('[BiteFight] All menu items disabled');
          } catch (error) {
              console.error('[BiteFight] Error saving menu settings:', error);
          }
      });
  }
  
  function populateCustomTab(ui) {
      const container = ui.querySelector('#customButtonsList');
      const toggleContainer = ui.querySelector('#customButtonToggleContainer');
      
      if (!container || !toggleContainer) return;
  
      updateCustomButtonsList(container);
      updateCustomButtonToggleList(toggleContainer);
      
      const addBtn = ui.querySelector('#addCustomButton');
      if (addBtn) {
          addBtn.addEventListener('click', () => {
              const name = ui.querySelector('#customButtonName').value.trim();
              const url = ui.querySelector('#customButtonUrl').value.trim();
              const newTab = ui.querySelector('#customButtonNewTab').checked;
              const position = ui.querySelector('#customButtonPosition').value;
              
              if (!name || !url) {
                  alert(t('pleaseEnterNameAndUrl'));
                  return;
              }
              
              const newButton = { 
                  name, 
                  url, 
                  newTab,
                  enabled: true,
                  position: position
              };
              
              if (position === 'between-standard') {
                  const standardItems = getMenuItems();
                  if (standardItems.length > 0) {
                      const insertAfterIndex = prompt(
                          `Nach welchem Standard-Menüpunkt soll "${name}" eingefügt werden?\n\n` +
                          standardItems.map((item, index) => `${index}: ${item.text}`).join('\n') +
                          '\n\nBitte Index eingeben (0-' + (standardItems.length - 1) + '):'
                      );
                      
                      const index = parseInt(insertAfterIndex);
                      if (!isNaN(index) && index >= 0 && index < standardItems.length) {
                          newButton.insertAfterIndex = index;
                      } else {
                          newButton.position = 'after-time';
                      }
                  }
              }
              
              customButtons.push(newButton);
              saveCustomButtons();
          });
      }
  }
  
  function updateCustomButtonToggleList(container) {
      if (customButtons.length === 0) {
          container.innerHTML = `<p style="text-align: center; margin: 10px 0;" class="bitefight-text-secondary">${t('noButtonsAvailable')}</p>`;
          return;
      }
      
      let html = '';
      customButtons.forEach((button, index) => {
          const isChecked = button.enabled !== false;
          html += `
              <div class="bitefight-container" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 5px 0; border-radius: 6px;">
                  <span class="bitefight-text-primary">${button.name}</span>
                  <label style="display: flex; align-items: center; gap: 8px;">
                      <input type="checkbox" ${isChecked ? 'checked' : ''} data-custom-button-index="${index}" style="accent-color: #5a1a1a;">
                  </label>
              </div>
          `;
      });
      
      container.innerHTML = html;
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', (e) => {
              const buttonIndex = parseInt(e.target.dataset.customButtonIndex);
              customButtons[buttonIndex].enabled = e.target.checked;
              
              applyCustomButtonSettings();
              
              try {
                  localStorage.setItem(CUSTOM_BUTTONS_KEY, JSON.stringify(customButtons));
                  console.log('[BiteFight] Custom button settings saved:', customButtons);
              } catch (error) {
                  console.error('[BiteFight] Error saving custom button settings:', error);
              }
          });
      });
  }
  
  function populateSortingTab(ui) {
      const standardContainer = ui.querySelector('#standardMenuSorting');
      const customContainer = ui.querySelector('#customButtonSorting');
      
      if (standardContainer) {
          updateStandardMenuSorting(standardContainer);
      }
      
      if (customContainer) {
          updateCustomButtonSorting(customContainer);
      }
      
      const resetStandardBtn = ui.querySelector('#resetStandardOrder');
      const resetCustomBtn = ui.querySelector('#resetCustomOrder');
      
      if (resetStandardBtn) {
          resetStandardBtn.addEventListener('click', () => {
              if (confirm(t('confirmStandardReset'))) {
                  localStorage.removeItem(MENU_ORDER_KEY);
                  menuOrder = [];
                  showSaveNotification(t('standardOrderReset'));
                  setTimeout(() => {
                      window.location.reload();
                  }, 800);
              }
          });
      }
      
      if (resetCustomBtn) {
          resetCustomBtn.addEventListener('click', () => {
              if (confirm(t('confirmCustomReset'))) {
                  localStorage.removeItem(CUSTOM_ORDER_KEY);
                  customOrder = [];
                  saveAndReload(t('customOrderReset'));
              }
          });
      }
  }
  
  function updateCustomButtonsList(container) {
      if (customButtons.length === 0) {
          container.innerHTML = `<p style="text-align: center; margin: 20px 0;" class="bitefight-text-secondary">${t('noButtonsAvailable')}</p>`;
          return;
      }
      
      let html = '';
      customButtons.forEach((button, index) => {
          html += `
              <div class="bitefight-container" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; border-radius: 6px;">
                  <div>
                      <div style="font-weight: bold;" class="bitefight-text-primary">${button.name}</div>
                      <div style="font-size: 11px;" class="bitefight-text-secondary">${button.url}</div>
                      <div style="font-size: 10px;" class="bitefight-text-warning">${button.newTab ? t('newTab') : t('sameTab')}</div>
                  </div>
                  <div style="display: flex; gap: 5px;">
                      <button data-action="edit-custom" data-index="${index}" class="bitefight-btn" style="padding: 4px 8px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 10px;">${t('editButton')}</button>
                      <button data-action="delete-custom" data-index="${index}" class="bitefight-btn-danger" style="padding: 4px 8px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 10px;">${t('deleteButton')}</button>
                  </div>
              </div>
          `;
      });
      
      container.innerHTML = html;
  
      container.addEventListener('click', (e) => {
          const action = e.target.dataset.action;
          const index = parseInt(e.target.dataset.index);
          
          if (action === 'edit-custom') {
              editCustomButton(index);
          } else if (action === 'delete-custom') {
              deleteCustomButton(index);
          }
      });
  }
  
  // ===== KORRIGIERTE updateStandardMenuSorting FUNKTION MIT STABILEN IDs =====
  function updateStandardMenuSorting(container) {
      const menuItems = getMenuItems();
      
      console.log('[BiteFight] Standard menu items found:', menuItems.length);
      
      if (menuItems.length === 0) {
          container.innerHTML = '<p style="text-align: center;" class="bitefight-text-secondary">Keine Standard-Menüpunkte gefunden</p>';
          return;
      }
      
      // Sortiere basierend auf gespeicherter Reihenfolge
      let sortedItems = [...menuItems];
      if (menuOrder.length > 0) {
          sortedItems = [];
          menuOrder.forEach(orderId => {
              const item = menuItems.find(mi => mi.id === orderId);
              if (item) {
                  sortedItems.push(item);
              }
          });
          
          // Füge neue Items hinzu, die nicht in der Reihenfolge sind
          menuItems.forEach(item => {
              if (!menuOrder.includes(item.id)) {
                  sortedItems.push(item);
              }
          });
      }
      
      let html = '';
      sortedItems.forEach((item, index) => {
          html += `
              <div class="bitefight-container" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 4px 0; border-radius: 4px; font-size: 12px;" 
                   data-item-id="${item.id}" data-item-text="${item.text}">
                  <span class="bitefight-text-primary" title="${item.href}">[Standard] ${item.text}</span>
                  <div>
                      <button class="move-standard-btn bitefight-btn" data-index="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''} 
                              style="padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; margin: 0 2px; min-width: 25px;">↑</button>
                      <button class="move-standard-btn bitefight-btn" data-index="${index}" data-direction="1" ${index === sortedItems.length - 1 ? 'disabled' : ''} 
                              style="padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; margin: 0 2px; min-width: 25px;">↓</button>
                  </div>
              </div>
          `;
      });
      
      container.innerHTML = html;
      
      // KORRIGIERTE Event listeners mit verbesserter Debugging
      const moveButtons = container.querySelectorAll('.move-standard-btn');
      moveButtons.forEach(button => {
          button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const index = parseInt(e.target.dataset.index);
              const direction = parseInt(e.target.dataset.direction);
              
              console.log(`[BiteFight] Moving item at index ${index} in direction ${direction}`);
              console.log(`[BiteFight] Current sorted items:`, sortedItems.map(item => item.text));
              
              if (isNaN(index) || isNaN(direction)) {
                  console.error('[BiteFight] Invalid index or direction:', index, direction);
                  return;
              }
              
              moveStandardItem(index, direction, sortedItems);
          });
      });
      
      window.currentStandardSort = sortedItems;
  }
  
  function updateCustomButtonSorting(container) {
      if (customButtons.length === 0) {
          container.innerHTML = `<p style="text-align: center;" class="bitefight-text-secondary">${t('noCustomButtonsAvailable')}</p>`;
          return;
      }
      
      let sortedButtons = [...customButtons];
      if (customOrder.length > 0) {
          sortedButtons = [];
          customOrder.forEach(orderId => {
              const button = customButtons.find(btn => `custom-${btn.name.replace(/\s+/g, '-')}` === orderId);
              if (button) {
                  sortedButtons.push(button);
              }
          });
          
          customButtons.forEach(button => {
              const buttonId = `custom-${button.name.replace(/\s+/g, '-')}`;
              if (!customOrder.includes(buttonId)) {
                  sortedButtons.push(button);
              }
          });
      }
      
      let html = '';
      sortedButtons.forEach((button, index) => {
          html += `
              <div class="bitefight-container" style="display: flex; justify-content: space-between; align-items: center; padding: 6px; margin: 2px 0; border-radius: 4px; font-size: 11px;">
                  <span class="bitefight-text-warning">[Custom] ${button.name}</span>
                  <div>
                      <button data-action="move-custom" data-index="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''} class="bitefight-btn" style="padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px; margin: 0 1px;">↑</button>
                      <button data-action="move-custom" data-index="${index}" data-direction="1" ${index === sortedButtons.length - 1 ? 'disabled' : ''} class="bitefight-btn" style="padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px; margin: 0 1px;">↓</button>
                  </div>
              </div>
          `;
      });
      
      container.innerHTML = html;
      
      container.addEventListener('click', (e) => {
          if (e.target.dataset.action === 'move-custom') {
              const index = parseInt(e.target.dataset.index);
              const direction = parseInt(e.target.dataset.direction);
              moveCustomButton(index, direction, sortedButtons);
          }
      });
      
      window.currentCustomSort = sortedButtons;
  }
  
  // ===== GLOBALE FUNKTIONEN FÜR BUTTON-VERWALTUNG =====
  
  function editCustomButton(index) {
      const button = customButtons[index];
      if (!button) return;
      
      const dialog = createEditDialog(button, index);
      document.body.appendChild(dialog);
  }
  
  function deleteCustomButton(index) {
      const button = customButtons[index];
      if (!button) return;
      
      if (confirm(t('confirmDelete', button.name))) {
          customButtons.splice(index, 1);
          saveCustomButtons();
      }
  }
  
  // ===== KORRIGIERTE moveStandardItem FUNKTION =====
  function moveStandardItem(fromIndex, direction, items) {
      if (!items || !Array.isArray(items)) {
          console.error('[BiteFight] Invalid items array for moveStandardItem');
          items = window.currentStandardSort || [];
      }
      
      const toIndex = fromIndex + direction;
      
      console.log(`[BiteFight] Attempting to move item from ${fromIndex} to ${toIndex} (total items: ${items.length})`);
      
      if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
          console.warn('[BiteFight] Move operation out of bounds');
          return;
      }
      
      // Tausche die Items
      [items[fromIndex], items[toIndex]] = [items[toIndex], items[fromIndex]];
      
      console.log('[BiteFight] Items swapped. New order:', items.map(item => item.text));
      
      // Erstelle neue Reihenfolge basierend auf stabilen IDs
      const newOrder = items.map(item => item.id);
      
      console.log('[BiteFight] Saving new menu order:', newOrder);
      
      // Speichere und wende sofort an
      try {
          localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(newOrder));
          menuOrder = newOrder;
          
          // Wende die neue Reihenfolge sofort im DOM an
          applyMenuOrder();
          
          // Aktualisiere die Sortier-UI
          const container = document.querySelector('#standardMenuSorting');
          if (container) {
              updateStandardMenuSorting(container);
          }
          
          showSaveNotification(t('menuOrderSaved'));
          
      } catch (error) {
          console.error('[BiteFight] Error saving menu order:', error);
      }
  }
  
  function moveCustomButton(index, direction, buttons) {
      if (!buttons) buttons = window.currentCustomSort;
      if (!buttons) return;
      
      const newIndex = index + direction;
      
      if (newIndex < 0 || newIndex >= buttons.length) return;
      
      [buttons[index], buttons[newIndex]] = [buttons[newIndex], buttons[index]];
      
      const newOrder = buttons.map(button => `custom-${button.name.replace(/\s+/g, '-')}`);
      saveCustomOrder(newOrder);
  }
  
  function createEditDialog(button, index) {
      const dialog = document.createElement('div');
      dialog.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 10002;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Trajan Pro', 'Times New Roman', serif;
      `;
      
      dialog.innerHTML = `
          <div class="bitefight-ui" style="padding: 20px; min-width: 400px; border-radius: 12px;">
              <h3 style="margin: 0 0 15px 0;" class="bitefight-text-primary">${t('editButtonTitle')}</h3>
              <div style="margin-bottom: 10px;">
                  <label style="display: block; margin-bottom: 5px;" class="bitefight-text-primary">${t('buttonNameLabel')}</label>
                  <input type="text" id="editButtonName" value="${button.name}" class="bitefight-input" style="width: 100%; padding: 8px; border-radius: 4px; font-family: inherit; box-sizing: border-box;">
              </div>
              <div style="margin-bottom: 10px;">
                  <label style="display: block; margin-bottom: 5px;" class="bitefight-text-primary">${t('urlLabel')}</label>
                  <input type="text" id="editButtonUrl" value="${button.url}" class="bitefight-input" style="width: 100%; padding: 8px; border-radius: 4px; font-family: inherit; box-sizing: border-box;">
              </div>
              <div style="margin-bottom: 10px;">
                  <label style="display: flex; align-items: center; gap: 8px;" class="bitefight-text-primary">
                      <input type="checkbox" id="editButtonNewTab" ${button.newTab ? 'checked' : ''} style="accent-color: #5a1a1a;">
                      ${t('openInNewTab')}
                  </label>
              </div>
              <div style="margin-bottom: 15px;">
                  <label style="display: block; margin-bottom: 5px;" class="bitefight-text-primary">Position:</label>
                  <select id="editButtonPosition" class="bitefight-input" style="padding: 8px; border-radius: 4px; font-family: inherit; width: 100%; box-sizing: border-box;">
                      <option value="after-time" ${button.position === 'after-time' ? 'selected' : ''}>Nach Uhrzeit (Standard)</option>
                      <option value="between-standard" ${button.position === 'between-standard' ? 'selected' : ''}>Zwischen Standard-Menü</option>
                  </select>
              </div>
              <div style="display: flex; gap: 10px; justify-content: flex-end;">
                  <button id="saveEditButton" class="bitefight-btn" style="padding: 8px 16px; border-radius: 6px; cursor: pointer; font-family: inherit;">${t('save')}</button>
                  <button id="cancelEditButton" class="bitefight-btn-danger" style="padding: 8px 16px; border-radius: 6px; cursor: pointer; font-family: inherit;">${t('cancel')}</button>
              </div>
          </div>
      `;
      
      const saveBtn = dialog.querySelector('#saveEditButton');
      const cancelBtn = dialog.querySelector('#cancelEditButton');
      
      saveBtn.addEventListener('click', () => {
          const name = dialog.querySelector('#editButtonName').value.trim();
          const url = dialog.querySelector('#editButtonUrl').value.trim();
          const newTab = dialog.querySelector('#editButtonNewTab').checked;
          const position = dialog.querySelector('#editButtonPosition').value;
          
          if (!name || !url) {
              alert(t('pleaseEnterNameAndUrl'));
              return;
          }
          
          const updatedButton = { 
              ...customButtons[index], 
              name, 
              url, 
              newTab, 
              position 
          };
          
          if (position === 'between-standard' && button.position !== 'between-standard') {
              const standardItems = getMenuItems();
              if (standardItems.length > 0) {
                  const insertAfterIndex = prompt(
                      `Nach welchem Standard-Menüpunkt soll "${name}" eingefügt werden?\n\n` +
                      standardItems.map((item, index) => `${index}: ${item.text}`).join('\n') +
                      '\n\nBitte Index eingeben (0-' + (standardItems.length - 1) + '):'
                  );
                  
                  const index = parseInt(insertAfterIndex);
                  if (!isNaN(index) && index >= 0 && index < standardItems.length) {
                      updatedButton.insertAfterIndex = index;
                  } else {
                      updatedButton.position = 'after-time';
                      delete updatedButton.insertAfterIndex;
                  }
              }
          } else if (position === 'after-time') {
              delete updatedButton.insertAfterIndex;
          }
          
          customButtons[index] = updatedButton;
          saveCustomButtons();
          dialog.remove();
      });
      
      cancelBtn.addEventListener('click', () => {
          dialog.remove();
      });
      
      return dialog;
  }
  
  // ===== UI-VERWALTUNG =====
  
  // Globale Variable für Scroll-Position
let lastScrollPosition = 0;

function openUI() {
    closeUI();
    
    // Speichere aktuelle Scroll-Position
    lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Füge CSS-Klasse hinzu für selektiven Blur-Effekt und Scroll-Sperrung
    document.body.classList.add('bitefight-ui-open');
    
    // Zusätzliche Scroll-Sperrung für maximale Kompatibilität
    document.body.style.top = `-${lastScrollPosition}px`;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    
    // Erstelle UI mit Overlay
    uiContainer = createSettingsUI();
    document.body.appendChild(uiContainer);
    
    switchTab(activeTab.toString(), uiContainer.querySelector('.bitefight-ui'));
    
    console.log('[BiteFight] UI opened with complete scroll prevention - menu remains visible');
  }

  function closeUI() {
      if (uiContainer && uiContainer.parentNode) {
          uiContainer.parentNode.removeChild(uiContainer);
          uiContainer = null;
      }
      
      if (settingsWindow && settingsWindow.parentNode) {
          settingsWindow.parentNode.removeChild(settingsWindow);
          settingsWindow = null;
      }
      
      // Entferne CSS-Klasse um Blur-Effekt zu entfernen
      document.body.classList.remove('bitefight-ui-open');
      
      // Stelle Hintergrund-Scrolling wieder her
      document.body.style.top = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      
      // Stelle ursprüngliche Scroll-Position wieder her
      window.scrollTo(0, lastScrollPosition);
      
      console.log('[BiteFight] UI closed and scroll restored to position:', lastScrollPosition);
  }
  
  function toggleUI() {
      if (uiContainer) {
          closeUI();
      } else {
          openUI();
      }
  }
  
  // ===== KEYBOARD HANDLER =====
  
  document.addEventListener('keydown', function(e) {
      if (e.key === 'F2') {
          e.preventDefault();
          toggleUI();
      } else if (e.key === 'Escape') {
          if (uiContainer || settingsWindow) {
              closeUI();
          }
      }
  });
  
  // ===== DEBUG-FUNKTIONEN =====

// ===== KORRIGIERTE DEBUG-FUNKTIONEN =====

function debugMenuItems() {
  console.log('=== MENU DEBUG ===');
  const items = getMenuItems();
  console.log('Current menu items:', items);
  console.log('Current menu order:', menuOrder);
  console.log('Menu in DOM:', document.querySelectorAll('#menuHead li'));
  console.log('Custom buttons:', customButtons);
  console.log('Custom order:', customOrder);
  console.log('Advanced settings:', advancedSettings);
  console.log('Menu settings:', menuSettings);
  console.log('==================');
}

// ===== HAUPTINITIALISIERUNG =====

function init() {
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
  }
  
  if (!isValidBiteFightDomain() || !isValidBiteFightPath()) {
      console.log('[BiteFight] Not on a valid BiteFight page, script disabled');
      return;
  }
  
  console.log('[BiteFight] Script initializing...');
  
  initModalObserver();
  
  setTimeout(() => {
      initializeMenu();
      initMenuObserver();
  }, 500);
  
  setTimeout(() => {
      applyAdvancedSettings();
      applyMenuSettings();
      applyCustomButtonSettings();
  }, 1000);
}

function initializeMenu() {
  const menu = document.querySelector('#menuHead');
  if (!menu) {
      console.log('[BiteFight] Menu not found, retrying...');
      setTimeout(initializeMenu, 1000);
      return;
  }
  
  applySortedCustomButtons(menu);
  
  setTimeout(() => {
      applyMenuSettings();
      applyCustomButtonSettings();
      applyMenuOrder(); // NEU: Wende gespeicherte Menü-Reihenfolge an
  }, 100);
  
  menu.style.opacity = '1';
  
  console.log('[BiteFight] Menu initialized successfully');
}

function isValidBiteFightDomain() {
  return window.location.hostname.includes('bitefight.gameforge.com');
}

function isValidBiteFightPath() {
  const currentPath = window.location.pathname;
  const validPaths = [
      /^\/profile($|\/.*)/, /^\/city($|\/.*)/, /^\/clan($|\/.*)/, /^\/hunt($|\/.*)/, 
      /^\/messages($|\/.*)/, /^\/msg($|\/.*)/, /^\/report($|\/.*)/, /^\/graveyard($|\/.*)/, 
      /^\/fight($|\/.*)/, /^\/admin($|\/.*)/, /^\/ranking($|\/.*)/, /^\/robbery($|\/.*)/, 
      /^\/hideout($|\/.*)/, /^\/user($|\/.*)/, /^\/buddy($|\/.*)/, /^\/main($|\/.*)/, /^\/$/
  ];
  return validPaths.some(pattern => pattern.test(currentPath));
}

// ===== PERFORMANCE MONITORING =====

function logPerformance() {
  const loadTime = Date.now() - pageLoadStartTime;
  console.log(`[BiteFight] Script loaded in ${loadTime}ms`);
  
  // Performance-Statistiken
  const stats = {
      menuItems: getMenuItems().length,
      customButtons: customButtons.length,
      memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A',
      loadTime: loadTime + 'ms'
  };
  
  console.log('[BiteFight] Performance Stats:', stats);
}

// ===== ERROR HANDLING =====

window.addEventListener('error', function(e) {
  if (e.message.includes('BiteFight') || e.filename?.includes('content-script')) {
      console.error('[BiteFight] Script Error:', {
          message: e.message,
          filename: e.filename,
          line: e.lineno,
          column: e.colno,
          stack: e.error?.stack
      });
  }
});

// ===== CLEANUP UND FINALE INITIALISIERUNG =====

init();

// Performance-Logging nach Initialisierung
setTimeout(logPerformance, 3000);

window.addEventListener('beforeunload', function() {
  if (domObserver) {
      domObserver.disconnect();
      console.log('[BiteFight] DOM observer disconnected');
  }
  if (modalObserver) {
      modalObserver.disconnect();
      console.log('[BiteFight] Modal observer disconnected');
  }
  
  // Cleanup UI
  closeUI();
  
  console.log('[BiteFight] Script cleanup completed');
});

// ===== GLOBALE SCRIPT-INFORMATION =====

console.log(`
🦇 ===== BITEFIGHT MENU CUSTOMIZER LOADED ===== 🦇
Version: 3.0.0
Features: ✅ Dark Theme ✅ Menu Sorting ✅ Custom Buttons ✅ Advanced Settings
Debug: Add ?debug=true to URL for debug button
Controls: Press F2 to open menu
================================================
`);

// ===== SCRIPT-ENDE =====

})();
