// utils/colorPalette.ts

/**
 * A utility function to generate a fixed palette of CSS variable names.
 * Used to ensure consistent colors for graph elements.
 */
export const getColorFromPalette = (index: number): string => {
  const palette = [
      "--blue",
      "--lavender",
      "--sapphire",
      "--sky",
      "--teal",
      "--green",
      "--yellow",
      "--peach",
      "--maroon",
      "--red",
      "--mauve",
      "--pink",
      "--flamingo",
      "--rosewater",
  ];
  return palette[index % palette.length]; // Cycle through the palette if the index exceeds its size
};
