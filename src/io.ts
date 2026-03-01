/**
 * Options IO — Import/export settings
 */
export class OptionsIO {
    /** Export all settings as JSON file */
    static async exportSettings(keys: string[], filename: string = 'settings.json', area: 'local' | 'sync' = 'local'): Promise<void> {
        const data = await chrome.storage[area].get(keys);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    }

    /** Import settings from JSON file */
    static async importSettings(area: 'local' | 'sync' = 'local'): Promise<Record<string, unknown>> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file'; input.accept = '.json';
            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return resolve({});
                const text = await file.text();
                const data = JSON.parse(text);
                await chrome.storage[area].set(data);
                resolve(data);
            };
            input.click();
        });
    }

    /** Reset all settings to defaults */
    static async resetToDefaults(defaults: Record<string, unknown>, area: 'local' | 'sync' = 'local'): Promise<void> {
        await chrome.storage[area].set(defaults);
    }
}
