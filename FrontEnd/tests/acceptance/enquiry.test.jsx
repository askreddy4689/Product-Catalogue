import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from '../../src/api/apiClient';
import { ApiError } from '../../src/api/ApiError';
import { answerApiCallsWithSampleData } from '../helpers/mockApi';
import { renderApp } from '../helpers/render';

jest.mock('../../src/api/apiClient');

/*
 * Acceptance criterion: Enquiry
 *   GIVEN I am viewing a product
 *   AND I am interested in a product
 *   AND I click on the Enquire button
 *   AND I complete the subsequent form with my contact details
 *   WHEN I submit the form
 *   THEN the sales inbox will receive an email   ← sent by the API (Backend/tests/api/enquiry.test.js)
 *   AND the customer will see a "Thank you" message
 */
describe('Enquiry', () => {
  beforeEach(() => answerApiCallsWithSampleData());

  async function openEnquiryFormForTheJacket(user) {
    renderApp('/products/3');
    await user.click(await screen.findByRole('link', { name: 'Enquire' }));
    await screen.findByRole('heading', { level: 1, name: 'Enquire about this product' });
  }

  test('submitting the completed form sends the enquiry and shows a thank-you message', async () => {
    const user = userEvent.setup();

    // GIVEN I am viewing a product, AND I click on the Enquire button
    await openEnquiryFormForTheJacket(user);

    // AND I complete the subsequent form with my contact details
    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Jane Smith');
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'jane@example.com');
    await user.type(
      screen.getByRole('textbox', { name: 'Phone number (optional)' }),
      '07700 900123',
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Message (optional)' }),
      'Is this available in medium?',
    );

    // WHEN I submit the form
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    // THEN the enquiry goes to the API, which emails the sales inbox
    expect(api.sendEnquiry).toHaveBeenCalledWith({
      productId: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '07700 900123',
      message: 'Is this available in medium?',
    });

    // AND the customer will see a "Thank you" message
    expect(await screen.findByRole('heading', { name: 'Thank you, Jane Smith!' })).toBeVisible();
    expect(screen.getByText(/Our sales team will reply to jane@example.com soon/)).toBeVisible();
  });

  test('phone and message can be left empty', async () => {
    const user = userEvent.setup();
    await openEnquiryFormForTheJacket(user);

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Jane Smith');
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByRole('heading', { name: 'Thank you, Jane Smith!' })).toBeVisible();
    expect(api.sendEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '', message: '' }),
    );
  });

  test('keeps what was typed and explains the problem when sending fails', async () => {
    const user = userEvent.setup();
    api.sendEnquiry.mockRejectedValue(
      new ApiError(
        'Sorry, we could not send your enquiry just now. Please try again in a few minutes.',
        { status: 502 },
      ),
    );
    await openEnquiryFormForTheJacket(user);

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Jane Smith');
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sorry, we could not send your enquiry just now.',
    );
    expect(screen.getByRole('textbox', { name: 'Your name' })).toHaveValue('Jane Smith');
    expect(screen.queryByRole('heading', { name: /Thank you/ })).not.toBeInTheDocument();
  });
});
