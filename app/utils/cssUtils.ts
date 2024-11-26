export const resolveCssVariable = (variableName: string): string => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    if (!value) {
        console.error(`CSS variable '${variableName}' is not defined.`);
    }
    return value;
};
