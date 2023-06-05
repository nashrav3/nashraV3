export function groupErrors(text: string): string {
  const lines = text.split("\n");
  const errorMap: Map<string, string[]> = new Map();

  // Group lines by error
  // eslint-disable-next-line no-restricted-syntax
  for (const line of lines) {
    const match = line.match(/(.+)=(.+)/);
    if (match) {
      const error = match[1].trim();
      const id = match[2].trim();
      const ids = errorMap.get(error) || [];
      ids.push(id);
      errorMap.set(error, ids);
    }
  }

  // Generate grouped text
  let groupedText = "";
  // eslint-disable-next-line no-restricted-syntax
  for (const [error, ids] of errorMap.entries()) {
    groupedText += `${error} (${ids.join(", ")})\n`;
  }

  return groupedText.trim();
}
