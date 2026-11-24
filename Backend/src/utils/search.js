/**
 * The agreed search rule (see docs/decisions.md):
 *  - only the product title is searched, and upper/lower case don't matter
 *  - every word typed must appear in the title, in any order
 *  - each typed word must match the START of a title word, so "shirt" finds
 *    "T-Shirts", but "men" does not find "Women's"
 */
function titleMatchesSearch(title, searchTerm) {
  const titleWords = splitIntoWords(title);
  const searchWords = splitIntoWords(searchTerm);
  if (searchWords.length === 0) return false;
  return searchWords.every((searchWord) =>
    titleWords.some((titleWord) => titleWord.startsWith(searchWord)),
  );
}

/** Example: "Men's T-Shirts" → ["mens", "t", "shirts"] */
function splitIntoWords(text) {
  return (
    text
      .toLowerCase()
      // Drop apostrophes so "men's" stays one word ("mens")
      .replace(/['’]/g, '')
      // Split on anything that is not a letter or a number
      .split(/[^\p{L}\p{N}]+/u)
      .filter((word) => word.length > 0)
  );
}

module.exports = { titleMatchesSearch };
