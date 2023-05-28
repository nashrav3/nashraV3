export function tokenToBotId(token: string): number {
  return Number(token.split(":")[0]);
}
