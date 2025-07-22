export const getURL = (url?: string): string => {
  if (!url) return "";
  return new URL(`${url}`, import.meta.url).toString();
};
