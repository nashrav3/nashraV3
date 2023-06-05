const entityMap = new Map<string, string>(
  Object.entries({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  })
);

export const escapeHTML = (source: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return String(source).replace(/[&<>"'/]/g, (s: string) => entityMap.get(s)!);
};
