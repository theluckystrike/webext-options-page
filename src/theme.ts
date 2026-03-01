/**
 * Options Theme — Light/dark theme for options page
 */
export class OptionsTheme {
    static apply(mode: 'light' | 'dark' | 'auto' = 'auto'): void {
        if (typeof document === 'undefined') return;
        let theme = mode;
        if (mode === 'auto') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.setVars(e.matches ? 'dark' : 'light');
            });
        }
        this.setVars(theme as 'light' | 'dark');
    }

    private static setVars(theme: 'light' | 'dark'): void {
        const vars = theme === 'dark'
            ? { '--bg': '#1e1e1e', '--surface': '#2a2a2a', '--text': '#e0e0e0', '--border': '#444', '--primary': '#8ab4f8' }
            : { '--bg': '#f5f5f5', '--surface': '#ffffff', '--text': '#1a1a1a', '--border': '#e0e0e0', '--primary': '#1a73e8' };
        Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
        document.body.style.cssText = `background:var(--bg);color:var(--text);transition:background .2s,color .2s;`;
    }
}
