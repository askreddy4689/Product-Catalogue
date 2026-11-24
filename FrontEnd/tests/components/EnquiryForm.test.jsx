import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../src/api/ApiError';
import EnquiryForm from '../../src/components/EnquiryForm';
import { renderWithProviders } from '../helpers/render';

describe('EnquiryForm', () => {
  const nameBox = () => screen.getByRole('textbox', { name: 'Your name' });
  const emailBox = () => screen.getByRole('textbox', { name: 'Email address' });
  const phoneBox = () => screen.getByRole('textbox', { name: 'Phone number (optional)' });
  const sendButton = () => screen.getByRole('button', { name: 'Send enquiry' });

  test('asks for a name and email address before sending', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderWithProviders(<EnquiryForm onSubmit={onSubmit} />);

    await user.click(sendButton());

    expect(screen.getByText('Please enter your name')).toBeVisible();
    expect(screen.getByText('Please enter your email address')).toBeVisible();
    expect(nameBox()).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('moves keyboard focus to the first field that needs fixing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EnquiryForm onSubmit={jest.fn()} />);

    await user.type(nameBox(), 'Jane Smith');
    await user.click(sendButton());

    // The name is fine, so focus goes to the email address, which is missing
    expect(emailBox()).toHaveFocus();
  });

  test('checks the email address and phone number look right', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderWithProviders(<EnquiryForm onSubmit={onSubmit} />);

    await user.type(nameBox(), 'Jane Smith');
    await user.type(emailBox(), 'jane@example');
    await user.type(phoneBox(), 'call me');
    await user.click(sendButton());

    expect(screen.getByText('Please enter a valid email address')).toBeVisible();
    expect(screen.getByText('Please enter a valid phone number')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('clears a field’s error as soon as the customer edits it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EnquiryForm onSubmit={jest.fn()} />);

    await user.click(sendButton());
    await user.type(nameBox(), 'J');

    expect(screen.queryByText('Please enter your name')).not.toBeInTheDocument();
  });

  test('sends trimmed details, and disables the button while sending', async () => {
    const user = userEvent.setup();
    let finishSending;
    const onSubmit = jest.fn(() => new Promise((resolve) => (finishSending = resolve)));
    renderWithProviders(<EnquiryForm onSubmit={onSubmit} />);

    await user.type(nameBox(), '  Jane Smith ');
    await user.type(emailBox(), 'jane@example.com ');
    await user.click(sendButton());

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '',
      message: '',
    });
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();

    finishSending();
    expect(await screen.findByRole('button', { name: 'Send enquiry' })).toBeEnabled();
  });

  test('shows problems reported by the server next to the right field', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockRejectedValue(
      new ApiError('Please check the highlighted fields.', {
        status: 400,
        fields: { email: 'Please enter a valid email address' },
      }),
    );
    renderWithProviders(<EnquiryForm onSubmit={onSubmit} />);

    await user.type(nameBox(), 'Jane Smith');
    await user.type(emailBox(), 'jane@example.invalid');
    await user.click(sendButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please check the highlighted fields.',
    );
    expect(screen.getByText('Please enter a valid email address')).toBeVisible();
    expect(emailBox()).toHaveAttribute('aria-invalid', 'true');
  });
});
