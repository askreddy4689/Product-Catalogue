import { siteConfig } from '../siteConfig';

/**
 * Writes a price for display, e.g. { amount: 55.99, currency: 'GBP' } → "£55.99".
 * The currency comes with the product data; the writing style comes from siteConfig.locale.
 */
export function formatPrice({ amount, currency }) {
  return new Intl.NumberFormat(siteConfig.locale, { style: 'currency', currency }).format(amount);
}
