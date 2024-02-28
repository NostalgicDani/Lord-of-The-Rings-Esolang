

declare global {
  interface String {
      replace_fr(target: string, replacement: string): string;
  }
}


String.prototype.replace_fr = function (target: string, replacement: string): string {
  const pattern = new RegExp(`\\b${target}\\b(?=(?:(?:[^"]*"){2})*[^"]*$)`, 'g');
  
  return this.replace(pattern, replacement);
}

export function transcribe(code: string) {
  return code
      .replace_fr("become", '=')
      .replace_fr("hobbit", 'let')
      .replace_fr("ring", 'const')
      .replace_fr("speak", 'print')
      .replace_fr("shall", 'func')
}