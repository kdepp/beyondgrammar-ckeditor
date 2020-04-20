export function loadScript (src: string): Promise<HTMLScriptElement> {
    return new Promise((resolve, reject) => {
        const $script   = document.createElement("script");

        $script.onload  = () => resolve($script);
        $script.onerror = () => reject(new Error(`Failed to load`));
        $script.src     = src;

        document.body.appendChild($script)
    })
}