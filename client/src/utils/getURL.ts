export const getURL = (url: string): string => {
  return new URL(`${url}`, import.meta.url).toString();
};

