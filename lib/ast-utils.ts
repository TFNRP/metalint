export const lineBreakPattern = /\r\n|[\r\n\u2028\u2029]/u;

export function createGlobalLineBreakPattern() {
  return new RegExp(lineBreakPattern.source, 'gu');
}

export function createStartLineBreakPattern() {
  return new RegExp('^' + lineBreakPattern.source, 'u');
}