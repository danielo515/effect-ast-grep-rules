import { Arr, Option } from "effect";

interface Analysis {
  readonly score: number;
}

declare const result: ReadonlyArray<Analysis>;
declare const use: (a: Analysis) => void;

// bad: length guard, then index
export function bad1() {
  if (result.length > 0) {
    const analysis = result[0];
    use(analysis!);
  }
}

// bad: the !== 0 spelling
export function bad2() {
  if (result.length !== 0) {
    use(result[0]!);
  }
}

// good: destructure, then narrow on the value itself
export function good1() {
  const [analysis] = result;
  if (analysis !== undefined) {
    use(analysis);
  }
}

// good: Option-returning head
export function good2() {
  return Option.map(Arr.head(result), (analysis) => analysis.score);
}

// good: a length guard that does not index
export function good3() {
  if (result.length > 0) {
    return "non-empty";
  }
  return "empty";
}
