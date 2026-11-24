/**
 * Test data for the backend tests, so they never call the real Fake Store API.
 * That makes the tests fast, work without the internet, and give the same result every time.
 *
 * The products below are a copy of the real Fake Store catalogue, with short descriptions.
 * They include the tricky cases the tests rely on:
 *  - Electronics: products 11 and 12 are both rated 4.8; 12 has more reviews (400 vs 319).
 *  - Men's clothing and Jewelery have only 4 products, fewer than the top rated count of 5.
 *  - "hiking" appears only in product 3's description, never in a title.
 */

/** Builds one product in Fake Store's own format. */
function product(id, title, price, category, rate, count, description = `About ${title}.`) {
  const image = `https://fakestoreapi.com/img/product-${id}.jpg`;
  return { id, title, price, description, category, image, rating: { rate, count } };
}

// prettier-ignore
const fakeStoreProducts = [
  //      id  title                                                                        price   category            rating  reviews
  product(1,  'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',                     109.95, "men's clothing",   3.9,    120),
  product(2,  'Mens Casual Premium Slim Fit T-Shirts',                                     22.3,   "men's clothing",   4.1,    259),
  product(3,  'Mens Cotton Jacket',                                                        55.99,  "men's clothing",   4.7,    500,
    'Great outerwear for spring, autumn and winter. Good for hiking, camping and climbing.'),
  product(4,  'Mens Casual Slim Fit',                                                      15.99,  "men's clothing",   2.1,    430),
  product(5,  "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet", 695,  'jewelery',         4.6,    400),
  product(6,  'Solid Gold Petite Micropave',                                               168,    'jewelery',         3.9,    70),
  product(7,  'White Gold Plated Princess',                                                9.99,   'jewelery',         3,      400),
  product(8,  'Pierced Owl Rose Gold Plated Stainless Steel Double',                       10.99,  'jewelery',         1.9,    100),
  product(9,  'WD 2TB Elements Portable External Hard Drive - USB 3.0',                    64,     'electronics',      3.3,    203),
  product(10, 'SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s',                       109,    'electronics',      2.9,    470),
  product(11, 'Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost SATA III 2.5', 109, 'electronics',      4.8,    319),
  product(12, 'WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive', 114,    'electronics',      4.8,    400),
  product(13, 'Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin',          599,    'electronics',      2.9,    250),
  product(14, 'Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor (LC49HG90DMNXZA)',       999.99, 'electronics',      2.2,    140),
  product(15, "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",                  56.99,  "women's clothing", 2.6,    235),
  product(16, "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",     29.95,  "women's clothing", 2.9,    340),
  product(17, 'Rain Jacket Women Windbreaker Striped Climbing Raincoats',                  39.99,  "women's clothing", 3.8,    679),
  product(18, "MBJ Women's Solid Short Sleeve Boat Neck V",                                9.85,   "women's clothing", 4.7,    130),
  product(19, "Opna Women's Short Sleeve Moisture",                                        7.95,   "women's clothing", 4.5,    146),
  product(20, 'DANVOUY Womens T Shirt Casual Cotton Short',                                12.99,  "women's clothing", 3.6,    145),
];

/**
 * Replaces the network call to Fake Store with a stand-in that answers with `body`
 * (the products above by default). Pass a status such as 500 to pretend Fake Store failed.
 */
function answerFakeStoreWith(body = fakeStoreProducts, status = 200) {
  global.fetch = jest.fn(async () => Response.json(body, { status }));
  return global.fetch;
}

/** The ids of a list of products, e.g. ['12', '11', '9'], to keep test expectations short. */
function idsOf(products) {
  return products.map((item) => item.id);
}

module.exports = { fakeStoreProducts, answerFakeStoreWith, idsOf };
