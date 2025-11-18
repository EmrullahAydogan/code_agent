declare module 'unidiff' {
  export interface Change {
    add?: boolean;
    del?: boolean;
    ln?: number;
    ln1?: number;
    ln2?: number;
    normal?: boolean;
    value: string;
  }

  export function diffLines(oldStr: string, newStr: string): Change[];
  export function formatLines(changes: Change[], options?: { context?: number }): string;
}
