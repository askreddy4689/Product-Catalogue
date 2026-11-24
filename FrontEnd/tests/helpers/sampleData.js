/**
 * Sample data in the shape the API returns (see docs/api.md), for the web app's tests.
 */

export const electronics = { id: 'electronics', name: 'Electronics' };
export const mensClothing = { id: 'mens-clothing', name: "Men's clothing" };
export const categories = [electronics, mensClothing];

function makeProduct({ id, title, price, category, rating: [average, count] }) {
  return {
    id,
    title,
    description: `All about the ${title}.`,
    price: { amount: price, currency: 'GBP' },
    imageUrl: `https://images.test/product-${id}.jpg`,
    category,
    rating: { average, count },
  };
}

export const cottonJacket = makeProduct({
  id: '3',
  title: 'Mens Cotton Jacket',
  price: 55.99,
  category: mensClothing,
  rating: [4.7, 500],
});

export const slimFitTShirt = makeProduct({
  id: '2',
  title: 'Mens Casual Premium Slim Fit T-Shirts',
  price: 22.3,
  category: mensClothing,
  rating: [4.1, 259],
});

// Listed best rated first, as the API sends top rated products
export const electronicsProducts = [
  makeProduct({
    id: '12',
    title: 'WD 4TB Gaming Drive',
    price: 114,
    category: electronics,
    rating: [4.8, 400],
  }),
  makeProduct({
    id: '11',
    title: 'Silicon Power 256GB SSD',
    price: 109,
    category: electronics,
    rating: [4.8, 319],
  }),
  makeProduct({
    id: '9',
    title: 'WD 2TB Portable Hard Drive',
    price: 64,
    category: electronics,
    rating: [3.3, 203],
  }),
  makeProduct({
    id: '10',
    title: 'SanDisk SSD PLUS 1TB',
    price: 109,
    category: electronics,
    rating: [2.9, 470],
  }),
  makeProduct({
    id: '13',
    title: 'Acer 21.5 inch Full HD Monitor',
    price: 599,
    category: electronics,
    rating: [2.9, 250],
  }),
  makeProduct({
    id: '14',
    title: 'Samsung 49 inch Curved Gaming Monitor',
    price: 999.99,
    category: electronics,
    rating: [2.2, 140],
  }),
];

export const allProducts = [cottonJacket, slimFitTShirt, ...electronicsProducts];

// What the API returns for the home page: the 5 highest rated products, best first
const [gamingDrive, ssd, portableDrive] = electronicsProducts;
export const topRatedProducts = [gamingDrive, ssd, cottonJacket, slimFitTShirt, portableDrive];

// What the API returns for the Electronics category page (top 5 rated + 1 more)
export const electronicsCategoryPage = {
  category: electronics,
  topRatedProducts: electronicsProducts.slice(0, 5),
  additionalProducts: electronicsProducts.slice(5),
};
