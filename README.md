# webext-options-page

[![npm version](https://img.shields.io/npm/v/webext-options-page)](https://npmjs.com/package/webext-options-page)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![CI Status](https://img.shields.io/github/actions/workflow/status/theluckystrike/webext-options-page/ci.yml?branch=main)](https://github.com/theluckystrike/webext-options-page/actions)
[![Discord](https://img.shields.io/badge/Discord-Zovo-blueviolet.svg?logo=discord)](https://discord.gg/zovo)
[![Website](https://img.shields.io/badge/Website-zovo.one-blue)](https://zovo.one)
[![GitHub Stars](https://img.shields.io/github/stars/theluckystrike/webext-options-page?style=social)](https://github.com/theluckystrike/webext-options-page)

> A ready-to-use options page template for Chrome extensions with form handling, validation, and storage integration.

## Overview

**webext-options-page** is a pre-built options page framework for Chrome extensions. It handles form validation, persistent settings storage, import/export functionality, and reset to defaults — all with a responsive design.

Part of the [Zovo](https://zovo.one) developer tools family.

## Features

- ✅ **Pre-Built UI** - Ready-to-use options interface
- ✅ **Form Validation** - Custom validation rules
- ✅ **Persistent Storage** - Auto-save to chrome.storage
- ✅ **Import/Export** - Backup and restore settings
- ✅ **Reset to Defaults** - One-click reset
- ✅ **Responsive Design** - Works on all screen sizes

## Installation

```bash
npm install webext-options-page
```

## Quick Start

### manifest.json

```json
{
  "options_page": "options.html",
  "permissions": ["storage"]
}
```

### HTML Structure

```html
<!-- options.html -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <form id="options-form">
    <section>
      <h2>General Settings</h2>
      <label>
        <input type="checkbox" name="enabled">
        Enable Extension
      </label>
    </section>
    
    <section>
      <h2>Notifications</h2>
      <label>
        <input type="checkbox" name="notifications">
        Enable Notifications
      </label>
      <label>
        Frequency
        <select name="frequency">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
    </section>
    
    <div class="actions">
      <button type="submit">Save</button>
      <button type="button" id="reset">Reset</button>
      <button type="button" id="export">Export</button>
      <button type="button" id="import">Import</button>
    </div>
  </form>
  <script src="options.js"></script>
</body>
</html>
```

### JavaScript Setup

```javascript
// options.js
import { OptionsPage } from 'webext-options-page';

const options = new OptionsPage({
  form: '#options-form',
  storage: 'local', // or 'sync'
  
  // Default values
  defaults: {
    enabled: true,
    notifications: true,
    frequency: 'daily'
  },
  
  // Validation rules
  validate: (values) => {
    const errors = {};
    if (values.frequency === 'daily' && !values.enabled) {
      errors.frequency = 'Must be enabled for daily notifications';
    }
    return errors;
  },
  
  // Before save hook
  onSave: (values) => {
    console.log('Saving:', values);
  },
  
  // After load hook
  onLoad: (values) => {
    console.log('Loaded:', values);
  }
});

options.init();
```

### Form Validation

```javascript
const options = new OptionsPage({
  validate: (values) => {
    const errors = {};
    
    if (!values.username || values.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (values.apiKey && !values.apiKey.startsWith('sk-')) {
      errors.apiKey = 'Invalid API key format';
    }
    
    return errors;
  }
});
```

### Import/Export

```javascript
// Export settings
document.getElementById('export').addEventListener('click', () => {
  options.exportSettings().then((json) => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extension-settings.json';
    a.click();
  });
});

// Import settings
document.getElementById('import').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      options.importSettings(e.target.result).then(() => {
        location.reload();
      });
    };
    reader.readAsText(file);
  };
  input.click();
});
```

## API

### new OptionsPage(options)

| Option | Type | Description |
|--------|------|-------------|
| form | string | CSS selector for form element |
| storage | string | 'local' or 'sync' |
| defaults | object | Default values |
| validate | function | Validation function |
| onSave | function | Called before save |
| onLoad | function | Called after load |

### Methods

| Method | Description |
|--------|-------------|
| `init()` | Initialize the options page |
| `getValues()` | Get current form values |
| `setValues(values)` | Set form values |
| `save()` | Save to storage |
| `reset()` | Reset to defaults |
| `exportSettings()` | Export as JSON string |
| `importSettings(json)` | Import from JSON |

## Styling

```css
/* Custom styling */
body {
  font-family: system-ui, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin-bottom: 24px;
}

label {
  display: block;
  margin: 8px 0;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"] {
  background: #4CAF50;
  color: white;
}
```

## Browser Support

- Chrome 80+
- Edge 80+

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/options-feature`
3. **Make** your changes
4. **Test** your changes: `npm test`
5. **Commit** your changes: `git commit -m 'Add new feature'`
6. **Push** to the branch: `git push origin feature/options-feature`
7. **Submit** a Pull Request

## Built by Zovo

Part of the [Zovo](https://zovo.one) developer tools family — privacy-first Chrome extensions built by developers, for developers.

## See Also

### Related Zovo Repositories

- [webext-popup-router](https://github.com/theluckystrike/webext-popup-router) - Routing for popup pages
- [chrome-extension-starter-mv3](https://github.com/theluckystrike/chrome-extension-starter-mv3) - Extension template
- [chrome-storage-plus](https://github.com/theluckystrike/chrome-storage-plus) - Type-safe storage
- [webext-reactive-store](https://github.com/theluckystrike/webext-reactive-store) - State management

### Zovo Chrome Extensions

- [Zovo Tab Manager](https://chrome.google.com/webstore/detail/zovo-tab-manager) - Manage tabs efficiently
- [Zovo Focus](https://chrome.google.com/webstore/detail/zovo-focus) - Block distractions
- [Zovo Permissions Scanner](https://chrome.google.com/webstore/detail/zovo-permissions-scanner) - Check extension privacy grades

Visit [zovo.one](https://zovo.one) for more information.

## License

MIT — [Zovo](https://zovo.one)

---

*Built by developers, for developers. No compromises on privacy.*
