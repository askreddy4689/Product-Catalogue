import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { ENQUIRY_LIMITS, validateEnquiry } from '../utils/validateEnquiry';

const EMPTY_FORM = { name: '', email: '', phone: '', message: '' };
const FIELDS_IN_ORDER = Object.keys(EMPTY_FORM);

/**
 * The customer's contact details form (acceptance criterion: Enquiry).
 *
 * It checks the input in the browser first, then calls `onSubmit` with the details.
 * If `onSubmit` fails, the problem is shown on the form and what the customer typed is kept.
 * Problems the server reports for particular fields appear under those fields.
 *
 * @param {object} props
 * @param {(details: typeof EMPTY_FORM) => Promise<unknown>} props.onSubmit
 */
export default function EnquiryForm({ onSubmit }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSending, setIsSending] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Clear a field's error as soon as the customer starts fixing it
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormError('');

    const errors = validateEnquiry(values);
    if (Object.keys(errors).length > 0) {
      showFieldErrors(form, errors);
      return;
    }

    setIsSending(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
      });
    } catch (error) {
      setFormError(error.message);
      showFieldErrors(form, error.fields ?? {});
    } finally {
      setIsSending(false);
    }
  }

  // Shows the error messages, then moves keyboard focus to the first field that needs
  // fixing, so keyboard and screen-reader users land on it and hear its message.
  function showFieldErrors(form, errors) {
    flushSync(() => setFieldErrors(errors)); // put the messages on the page before moving focus
    const firstFieldToFix = FIELDS_IN_ORDER.find((name) => errors[name]);
    if (firstFieldToFix) {
      form.elements.namedItem(firstFieldToFix).focus();
    }
  }

  // Props shared by every field: its value, change handler and any error message
  function fieldProps(name) {
    return {
      name,
      value: values[name],
      onChange: handleChange,
      error: Boolean(fieldErrors[name]),
      helperText: fieldErrors[name],
      fullWidth: true,
      slotProps: { htmlInput: { maxLength: ENQUIRY_LIMITS[name] } },
    };
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} aria-label="Enquiry form">
      <Stack spacing={2.5}>
        {formError && <Alert severity="error">{formError}</Alert>}

        <TextField {...fieldProps('name')} label="Your name" autoComplete="name" required />
        <TextField
          {...fieldProps('email')}
          label="Email address"
          type="email"
          autoComplete="email"
          required
        />
        <TextField
          {...fieldProps('phone')}
          label="Phone number (optional)"
          type="tel"
          autoComplete="tel"
        />
        <TextField {...fieldProps('message')} label="Message (optional)" multiline minRows={4} />

        <Box>
          <Button type="submit" variant="contained" size="large" disabled={isSending}>
            {isSending ? 'Sending…' : 'Send enquiry'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
