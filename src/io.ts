/**
 * Options IO — Import/export settings
 */

/**
 * Error class for OptionsIO operations
 */
export class OptionsIOError extends Error {
    constructor(
        message: string,
        public readonly code: 'PARSE_ERROR' | 'STORAGE_ERROR' | 'FILE_ERROR' | 'NO_FILE',
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'OptionsIOError';
    }
}

export interface ImportResult {
    success: boolean;
    data?: Record<string, unknown>;
    error?: OptionsIOError;
}

export class OptionsIO {
    /** Export all settings as JSON file */
    static async exportSettings(keys: string[], filename: string = 'settings.json', area: 'local' | 'sync' = 'local'): Promise<void> {
        try {
            const data = await chrome.storage[area].get(keys);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new OptionsIOError(
                `Failed to export settings: ${message}`,
                'STORAGE_ERROR',
                error
            );
        }
    }

    /** Import settings from JSON file */
    static async importSettings(area: 'local' | 'sync' = 'local'): Promise<ImportResult> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file'; input.accept = '.json';
            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) {
                    resolve({ 
                        success: false, 
                        error: new OptionsIOError(
                            'No file selected. Please select a JSON file to import.',
                            'NO_FILE'
                        ) 
                    });
                    return;
                }

                try {
                    const text = await file.text();
                    let data: unknown;
                    
                    try {
                        data = JSON.parse(text);
                    } catch (parseError) {
                        const message = parseError instanceof Error ? parseError.message : String(parseError);
                        resolve({ 
                            success: false, 
                            error: new OptionsIOError(
                                `Invalid JSON file: ${message}. Please ensure the file contains valid JSON.`,
                                'PARSE_ERROR',
                                parseError
                            ) 
                        });
                        return;
                    }

                    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                        resolve({ 
                            success: false, 
                            error: new OptionsIOError(
                                'Invalid file format. Expected a JSON object with key-value pairs.',
                                'PARSE_ERROR'
                            ) 
                        });
                        return;
                    }

                    await chrome.storage[area].set(data as Record<string, unknown>);
                    resolve({ success: true, data: data as Record<string, unknown> });
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    resolve({ 
                        success: false, 
                        error: new OptionsIOError(
                            `Failed to import settings: ${message}`,
                            'STORAGE_ERROR',
                            error
                        ) 
                    });
                }
            };
            // Handle case where file input is cancelled without selection
            input.oncancel = () => {
                resolve({ 
                    success: false, 
                    error: new OptionsIOError(
                        'File selection cancelled.',
                        'NO_FILE'
                    ) 
                });
            };
            input.click();
        });
    }

    /** Reset all settings to defaults */
    static async resetToDefaults(defaults: Record<string, unknown>, area: 'local' | 'sync' = 'local'): Promise<void> {
        try {
            await chrome.storage[area].set(defaults);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new OptionsIOError(
                `Failed to reset settings: ${message}`,
                'STORAGE_ERROR',
                error
            );
        }
    }
}
