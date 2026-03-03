/**
 * Options Page — Self-rendering settings page with storage integration
 */

export interface OptionField {
    key: string;
    label: string;
    type: 'toggle' | 'text' | 'number' | 'select' | 'color' | 'range';
    default?: unknown;
    options?: Array<{ value: string; label: string }>;
    description?: string;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    /** Optional validation function. Returns error message if invalid, undefined if valid */
    validate?: (value: unknown) => string | undefined;
}

export interface OptionSection {
    title: string;
    description?: string;
    icon?: string;
    fields: OptionField[];
}

/**
 * Error class for OptionsPage operations
 */
export class OptionsPageError extends Error {
    constructor(
        message: string,
        public readonly code: 'RENDER_ERROR' | 'STORAGE_ERROR' | 'VALIDATION_ERROR',
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'OptionsPageError';
    }
}

export class OptionsPage {
    private sections: OptionSection[];
    private storageArea: 'local' | 'sync';
    private container: HTMLElement | null = null;
    private errorContainer: HTMLElement | null = null;

    constructor(sections: OptionSection[], storageArea: 'local' | 'sync' = 'local') {
        this.sections = sections;
        this.storageArea = storageArea;
    }

    /** Render into a container element */
    async render(container: HTMLElement): Promise<void> {
        this.container = container;
        container.innerHTML = '';
        container.style.cssText = 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:680px;margin:0 auto;padding:24px;';

        try {
            // Load current values
            const allKeys = this.sections.flatMap((s) => s.fields.map((f) => f.key));
            const storage = chrome.storage[this.storageArea];
            
            let data: Record<string, unknown>;
            try {
                data = await storage.get(allKeys);
            } catch (storageError) {
                throw new OptionsPageError(
                    `Failed to load settings from storage: ${storageError instanceof Error ? storageError.message : String(storageError)}`,
                    'STORAGE_ERROR',
                    storageError
                );
            }

            for (const section of this.sections) {
                const sectionEl = document.createElement('div');
                sectionEl.style.cssText = 'margin-bottom:32px;background:var(--surface,#fff);border:1px solid var(--border,#e0e0e0);border-radius:12px;overflow:hidden;';

                // Section header
                const header = document.createElement('div');
                header.style.cssText = 'padding:16px 20px;background:var(--bg,#fafafa);border-bottom:1px solid var(--border,#e0e0e0);';
                header.innerHTML = `<h3 style="margin:0;font-size:15px;font-weight:600">${section.icon ? section.icon + ' ' : ''}${section.title}</h3>${section.description ? `<p style="margin:4px 0 0;font-size:12px;color:#666">${section.description}</p>` : ''}`;
                sectionEl.appendChild(header);

                // Fields
                for (const field of section.fields) {
                    const value = data[field.key] ?? field.default;
                    const row = this.createField(field, value);
                    sectionEl.appendChild(row);
                }

                container.appendChild(sectionEl);
            }

            // Save status
            const status = document.createElement('div');
            status.id = '__options_status__';
            status.style.cssText = 'text-align:center;padding:8px;font-size:12px;color:#34a853;opacity:0;transition:opacity 0.3s;';
            status.textContent = '✓ Saved';
            container.appendChild(status);
        } catch (error) {
            this.showError(error instanceof OptionsPageError ? error : new OptionsPageError(
                error instanceof Error ? error.message : String(error),
                'RENDER_ERROR',
                error
            ));
            throw error;
        }
    }

    /** Show error message in the container */
    private showError(error: OptionsPageError): void {
        if (!this.container) return;
        
        // Remove any existing error
        this.hideError();
        
        this.errorContainer = document.createElement('div');
        this.errorContainer.style.cssText = 'background:#fee2e2;border:1px solid #ef4444;border-radius:8px;padding:16px;margin-bottom:16px;';
        this.errorContainer.innerHTML = `
            <div style="color:#991b1b;font-weight:600;margin-bottom:4px">Error: ${error.code}</div>
            <div style="color:#7f1d1d;font-size:13px">${error.message}</div>
            ${error.code === 'VALIDATION_ERROR' ? '<div style="color:#7f1d1d;font-size:12px;margin-top:8px">Please check the value and try again.</div>' : ''}
            ${error.code === 'STORAGE_ERROR' ? '<div style="color:#7f1d1d;font-size:12px;margin-top:8px">Check that the extension has storage permissions.</div>' : ''}
        `;
        this.container.insertBefore(this.errorContainer, this.container.firstChild);
    }

    /** Hide error message */
    private hideError(): void {
        if (this.errorContainer && this.container) {
            this.container.removeChild(this.errorContainer);
            this.errorContainer = null;
        }
    }

    /** Get all current settings */
    async getAll(): Promise<Record<string, unknown>> {
        try {
            const allKeys = this.sections.flatMap((s) => s.fields.map((f) => f.key));
            return await chrome.storage[this.storageArea].get(allKeys);
        } catch (error) {
            throw new OptionsPageError(
                `Failed to get settings: ${error instanceof Error ? error.message : String(error)}`,
                'STORAGE_ERROR',
                error
            );
        }
    }

    private createField(field: OptionField, value: unknown): HTMLElement {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border,#f0f0f0);';

        const label = document.createElement('div');
        label.innerHTML = `<div style="font-size:13px;font-weight:500">${field.label}</div>${field.description ? `<div style="font-size:11px;color:#888;margin-top:2px">${field.description}</div>` : ''}`;
        row.appendChild(label);

        let input: HTMLElement;
        if (field.type === 'toggle') {
            input = document.createElement('input');
            (input as HTMLInputElement).type = 'checkbox';
            (input as HTMLInputElement).checked = !!value;
            input.onchange = () => this.saveWithValidation(field, (input as HTMLInputElement).checked);
        } else if (field.type === 'select') {
            input = document.createElement('select');
            (field.options || []).forEach((opt) => {
                const o = document.createElement('option');
                o.value = opt.value; o.textContent = opt.label;
                if (opt.value === String(value)) o.selected = true;
                input.appendChild(o);
            });
            input.style.cssText = 'padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;';
            input.onchange = () => this.saveWithValidation(field, (input as HTMLSelectElement).value);
        } else {
            input = document.createElement('input');
            (input as HTMLInputElement).type = field.type;
            (input as HTMLInputElement).value = String(value ?? '');
            if (field.placeholder) (input as HTMLInputElement).placeholder = field.placeholder;
            if (field.min !== undefined) (input as HTMLInputElement).min = String(field.min);
            if (field.max !== undefined) (input as HTMLInputElement).max = String(field.max);
            if (field.step !== undefined) (input as HTMLInputElement).step = String(field.step);
            input.style.cssText = 'padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:120px;';
            input.onchange = () => {
                const val = field.type === 'number' ? Number((input as HTMLInputElement).value) : (input as HTMLInputElement).value;
                this.saveWithValidation(field, val);
            };
        }

        row.appendChild(input);
        return row;
    }

    /** Save with validation */
    private async saveWithValidation(field: OptionField, value: unknown): Promise<void> {
        // Run validation if provided
        if (field.validate) {
            const validationError = field.validate(value);
            if (validationError) {
                this.showError(new OptionsPageError(
                    `Validation failed for "${field.label}": ${validationError}`,
                    'VALIDATION_ERROR'
                ));
                return;
            }
        }
        
        // Clear any previous errors on successful validation
        this.hideError();
        await this.save(field.key, value);
    }

    private async save(key: string, value: unknown): Promise<void> {
        try {
            await chrome.storage[this.storageArea].set({ [key]: value });
            const status = document.getElementById('__options_status__');
            if (status) { status.style.opacity = '1'; setTimeout(() => { status.style.opacity = '0'; }, 1500); }
        } catch (error) {
            this.showError(new OptionsPageError(
                `Failed to save "${key}": ${error instanceof Error ? error.message : String(error)}`,
                'STORAGE_ERROR',
                error
            ));
        }
    }
}
