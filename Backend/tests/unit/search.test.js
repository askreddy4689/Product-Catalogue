const { titleMatchesSearch } = require('../../src/utils/search');

describe('Search rule: titleMatchesSearch(title, searchTerm)', () => {
  test.each([
    // [title, search term, should match?, why]
    ['Mens Cotton Jacket', 'jacket', true, 'a whole word matches'],
    ['Mens Cotton Jacket', 'JACKET', true, 'upper/lower case does not matter'],
    ['Mens Cotton Jacket', 'jacket cotton', true, 'words can be in any order'],
    ['Mens Cotton Jacket', 'jacket wool', false, 'every word typed must match'],
    ['Mens Cotton Jacket', 'cot', true, 'the start of a word matches'],
    ['Mens Cotton Jacket', 'ton', false, 'the middle of a word does not match'],
    ['Mens Casual Premium Slim Fit T-Shirts', 'shirt', true, 'hyphens separate words'],
    ["MBJ Women's Solid Short Sleeve", 'men', false, '"men" is not the start of "Women\'s"'],
    ["Men's Hiking Boots", "men's", true, 'apostrophes are ignored'],
    ['Mens Cotton Jacket', '   ', false, 'a blank search matches nothing'],
  ])('"%s" with search "%s" → %s (%s)', (title, searchTerm, expected) => {
    expect(titleMatchesSearch(title, searchTerm)).toBe(expected);
  });
});
