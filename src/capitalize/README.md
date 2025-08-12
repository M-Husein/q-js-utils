# capitalize
Capitalizes the first letter.

## Usage
```ts
import { capitalize } from 'q-js-utils/capitalize';

console.log(capitalize("élève"));      // "Élève"
console.log(capitalize("mañana"));     // "Mañana"
```

# Original / Current Code
```ts
const capitalize = (word: string): string => {
  return word ? word.charAt(0).toLocaleUpperCase() + word.slice(1) : '';
}

```

## Option Function

```ts
/**
 * Capitalizes the first letter of each word in a string.
 * Handles:
 * - Unicode letters (accents, ñ, ü, etc.)
 * - Hyphenated words ("jean-luc" → "Jean-Luc")
 * - Apostrophes ("l'école" → "L'École")
 * 
 * @param str The input string to capitalize.
 * @returns The capitalized string.
 */
export const capitalizeWords = (str: string): string => {
  return str
    .toLocaleLowerCase()
    .replace(
      /(^|\s|[-'])\p{L}/gu,
      char => char.toLocaleUpperCase()
    );
}

// Sentence
console.log(capitalizeWords("élève très intelligent")); // "Élève Très Intelligent"
console.log(capitalizeWords("l'école est fermée"));     // "L'École Est Fermée"
console.log(capitalizeWords("jean-luc picard"));        // "Jean-Luc Picard"
```

## 🧠 Why This Works

- \p{L} → Matches any Unicode letter
- u flag → Enables Unicode awareness in regex
- g flag → Replaces all matches
- (^|\s|[-']) → Matches:
  - Start of string
  - Any whitespace
  - Hyphen (-)
  - Apostrophe (')
- toLocaleUpperCase() → Locale-aware uppercase conversion

## Option Funtion 2

```ts
/**
 * Options for capitalizeWords function.
 */
export interface CapitalizeWordsOptions {
  /** Locale to use for case conversion (default: browser locale) */
  locale?: string | string[];

  /** Preserve apostrophe capitalization, e.g., "l'école" → "L'École" (default: true) */
  preserveApostrophes?: boolean;

  /** Preserve hyphenated word capitalization, e.g., "jean-luc" → "Jean-Luc" (default: true) */
  preserveHyphens?: boolean;

  /** If true, capitalizes only the very first letter of the sentence (default: false) */
  capitalizeSentenceOnly?: boolean;
}

/**
 * Capitalizes the first letter of each word in a string (Title Case).
 * Unicode-safe and locale-aware.
 */
export function capitalizeTitleCase(
  str: string,
  {
    locale,
    preserveApostrophes = true,
    preserveHyphens = true
  }: Omit<CapitalizeWordsOptions, 'capitalizeSentenceOnly'> = {}
): string {
  const lower = str.toLocaleLowerCase(locale);

  // Build regex for boundaries
  const boundaryParts = ['\\s', '^'];
  if (preserveHyphens) boundaryParts.push('-');
  if (preserveApostrophes) boundaryParts.push("'");

  const boundaryRegex = new RegExp(`(${boundaryParts.join('|')})\\p{L}`, 'gu');

  return lower.replace(boundaryRegex, match =>
    match.toLocaleUpperCase(locale)
  );
}

/**
 * Capitalizes only the very first letter of a sentence (Sentence Case).
 * Unicode-safe and locale-aware.
 */
export function capitalizeSentenceCase(
  str: string,
  { locale }: Pick<CapitalizeWordsOptions, 'locale'> = {}
): string {
  const lower = str.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

/**
 * Wrapper that chooses between Title Case and Sentence Case based on options.
 */
export function capitalizeWords(
  str: string,
  options: CapitalizeWordsOptions = {}
): string {
  if (options.capitalizeSentenceOnly) {
    return capitalizeSentenceCase(str, { locale: options.locale });
  }
  return capitalizeTitleCase(str, options);
}

// ---------- EXAMPLES ----------

// Title case (default)
console.log(capitalizeWords("élève très intelligent"));
// "Élève Très Intelligent"

// Sentence case
console.log(capitalizeWords("élève très intelligent", { capitalizeSentenceOnly: true }));
// "Élève très intelligent"

// Apostrophes
console.log(capitalizeWords("l'école est fermée"));
// "L'École Est Fermée"

// Hyphens
console.log(capitalizeWords("jean-luc picard"));
// "Jean-Luc Picard"

// Spanish locale
console.log(capitalizeWords("mañana será otro día", { locale: "es" }));
// "Mañana Será Otro Día"
```
