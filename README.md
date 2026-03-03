# webext-options-page

A ready-to-use options page template for Chrome extensions with form handling, validation, and storage integration.

## Features

- Pre-built options UI
- Form validation
- Persistent settings storage
- Import/Export settings
- Reset to defaults
- Responsive design

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

## License

MIT
