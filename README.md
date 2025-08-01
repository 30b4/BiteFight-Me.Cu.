# 🦇 BiteFight Menu Customizer

Ein mächtiges Browser-Addon für BiteFight.gameforge.com, das das Spielmenü mit einem düsteren, vampirischen Design vollständig anpassbar macht.

![BiteFight Menu Customizer](https://img.shields.io/badge/Version-1.0.0-red?style=for-the-badge&logo=javascript)
![Platform](https://img.shields.io/badge/Platform-BiteFight-darkred?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

## ✨ Features

### 🎨 **Düsteres, furchteinflößendes Design**
- Vampirisches BiteFight-Theme mit dunklen Rottönen (#1a0a0a, #5a1a1a)
- Bedrohliche Hover-Effekte und Schatten
- Konsistente CSS-Klassen (.bitefight-btn, .bitefight-container, etc.)
- Furchteinflößende Textfarben mit Glow-Effekten

### 🌫️ **Selektiver Hintergrund-Blur**
- Nur der Spielinhalt verschwimmt bei geöffneter UI
- Perfekte Fokussierung auf die Menü-Einstellungen
- Smooth Übergangseffekte (0.3s ease)

### 🎯 **Menü bleibt scharf sichtbar**
- `#menu` Container komplett vom Blur ausgenommen
- Live-Vorschau aller Änderungen am Menü
- Interaktive Custom Buttons bleiben voll funktionsfähig
- Zeit-Element (#time) ebenfalls scharf dargestellt

### 🚫 **Komplette Scroll-Sperrung**
- Hintergrund nicht scrollbar bei geöffneter UI
- `overflow: hidden` und `position: fixed` für Body und HTML
- Touch-Scrolling Prevention für Mobile-Geräte
- Scroll-Position wird automatisch wiederhergestellt

### 📜 **UI-internes Scrolling**
- Funktioniert normal innerhalb der Fenster
- `overflow-y: auto` nur für UI-Inhalt
- Maximale Höhe: 70vh-80vh je nach Fenster
- Smooth Scrolling-Verhalten

### 🎭 **Konsistente Dialoge**
- Hauptfenster, Advanced Settings und Information verwenden alle das gleiche Design
- Einheitliche Overlay-Struktur mit Blur-Effekt
- Klick-außerhalb-schließt Funktionalität
- Benutzerfreundliche Navigation zwischen Dialogen

### 🔧 **Standard-Menü Sortierung**
- Funktioniert mit stabilen IDs (URL-basiert statt Index)
- Sofortige Anwendung ohne Page Reload (Standard)
- Drag & Drop ähnliche Pfeil-Navigation (↑↓)
- Robuste Error-Behandlung und Console-Logging

### ⚙️ **Custom Button Management**
- Vollständiges CRUD (Create, Read, Update, Delete)
- Intelligente Positionierung zwischen Standard-Menü oder nach Uhrzeit
- Toggle-Funktionen für Ein/Aus-Schaltung
- Sortierung und Neuanordnung möglich
- Sofortige Sichtbarkeit ohne Reload

## 🚀 Installation

### Voraussetzungen
- Browser mit Userscript-Manager (Tampermonkey, Greasemonkey, Violentmonkey)
- Aktiver BiteFight.gameforge.com Account

### Schritt-für-Schritt
1. **Userscript-Manager installieren**
   - [Tampermonkey](https://tampermonkey.net/) (empfohlen)
   - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)
   - [Violentmonkey](https://violentmonkey.github.io/) (Open Source)

2. **Script installieren**

![manage Standard menu]({66A931F5-DC81-4443-808F-8213FFC43735}.png)
![manage Custom menu]({19630596-AA9E-4B09-B685-3E019413EC75}.png)
![sort your menu]({8F305554-95CB-453D-8821-53D5CF31CC16}.png)
![Advanced Settings]({30FE3ED9-1B55-4632-9EF3-914A32253ED7}.png)
![Information]({A2FB512A-5558-4BF6-9DA7-DE7F407AAC0B}.png)

[30b4.de](https://www.30b4.de/)