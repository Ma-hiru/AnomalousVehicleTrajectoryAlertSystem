export const getURLSearchParam = (url: string, paramName: string):string[] => {
  const regex = new RegExp(`[?&]${paramName}=([^&#]*)`);
  const match = url.match(regex) ?? [];
  return match.reduce((pre, cur) => {
    if (cur) {
      pre.push(decodeURIComponent(cur.replace(/\+/g, " ")));
    }
    return pre;
  }, [] as string[]);
};
