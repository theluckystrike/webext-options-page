# webext-options-page — Pre-Built Options Page for Chrome Extensions

[![npm](https://img.shields.io/npm/v/webext-options-page.svg)](https://www.npmjs.com/package/webext-options-page)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Built by [Zovo](https://zovo.one)**

**Self-rendering options page framework** — define your settings schema, automatically get a beautiful settings UI with chrome.storage integration, import/export, and theme support.

## 📦 Install
```bash
npm install webext-options-page
```

## 🚀 Quick Start
```typescript
import { OptionsPage, OptionsTheme, OptionsIO } from 'webext-options-page';

OptionsTheme.apply('auto');

const page = new OptionsPage([
  { title: 'General', icon: '⚙️', fields: [
    { key: 'darkMode', label: 'Dark Mode', type: 'toggle', default: false },
    { key: 'fontSize', label: 'Font Size', type: 'range', min: 12, max: 24, default: 14 },
    { key: 'language', label: 'Language', type: 'select', options: [
      { value: 'en', label: 'English' }, { value: 'es', label: 'Español' }
    ]},
  ]},
]);

page.render(document.getElementById('app')!);
```

## 📄 License
MIT — [Zovo](https://zovo.one)
