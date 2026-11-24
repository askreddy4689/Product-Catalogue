// Settings used by every test, instead of a .env file.
Object.assign(process.env, {
  WEB_APP_URL: 'https://shop.test',
  FAKE_STORE_API_URL: 'https://fakestore.test',
  PRICE_CURRENCY: 'GBP',
  TOP_RATED_COUNT: '5',
  SALES_INBOX_EMAIL: 'sales@shop.test',
  SMTP_USER: 'catalogue@gmail.test',
  SMTP_PASSWORD: 'test-app-password',
});
