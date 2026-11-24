import { formatPrice } from '../../src/utils/formatPrice';
import { validateEnquiry } from '../../src/utils/validateEnquiry';

describe('formatPrice', () => {
  test.each([
    [{ amount: 55.99, currency: 'GBP' }, '£55.99'],
    [{ amount: 22.3, currency: 'GBP' }, '£22.30'],
    [{ amount: 999.99, currency: 'USD' }, 'US$999.99'],
  ])('writes %o as %s', (price, expected) => {
    expect(formatPrice(price)).toBe(expected);
  });
});

describe('validateEnquiry', () => {
  const valid = { name: 'Jane Smith', email: 'jane@example.com', phone: '', message: '' };

  test('accepts a name and email address, with phone and message left empty', () => {
    expect(validateEnquiry(valid)).toEqual({});
  });

  test('accepts common phone number formats', () => {
    for (const phone of ['07700 900123', '+44 (0)20 7946 0958', '020-7946-0958']) {
      expect(validateEnquiry({ ...valid, phone })).toEqual({});
    }
  });

  test('rejects a phone number without enough digits', () => {
    for (const phone of ['-------', '( ) ( ) ( )', '(01) 234']) {
      expect(validateEnquiry({ ...valid, phone })).toEqual({
        phone: 'Please enter a valid phone number',
      });
    }
  });

  test('treats a name made only of spaces as missing', () => {
    expect(validateEnquiry({ ...valid, name: '   ' })).toEqual({ name: 'Please enter your name' });
  });

  test('rejects a message longer than 2000 characters', () => {
    expect(validateEnquiry({ ...valid, message: 'x'.repeat(2001) })).toEqual({
      message: 'Message must be 2000 characters or fewer',
    });
  });
});
