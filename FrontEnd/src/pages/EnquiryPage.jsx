import { useEffect, useRef } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { Link as RouterLink, useParams } from 'react-router';
import { useProduct, useSendEnquiry } from '../api/queries';
import { ErrorMessage, LoadingIndicator, PageBreadcrumbs } from '../components/PageParts';
import EnquiryForm from '../components/EnquiryForm';
import { siteConfig } from '../siteConfig';
import { formatPrice } from '../utils/formatPrice';

/**
 * The enquiry page for one product (acceptance criterion: Enquiry).
 * Shows which product the enquiry is about and the contact form.
 * Once sent, the form is replaced by a thank-you message.
 */
export default function EnquiryPage() {
  const { productId } = useParams();
  const { data: product, isPending, isError, error, refetch } = useProduct(productId);
  const sendEnquiry = useSendEnquiry();

  if (isPending) {
    return <LoadingIndicator label="Loading product" />;
  }
  if (isError) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  if (sendEnquiry.isSuccess) {
    return (
      <ThankYouMessage
        product={product}
        customerName={sendEnquiry.variables.name}
        customerEmail={sendEnquiry.variables.email}
      />
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <title>{`Enquire: ${product.title} | ${siteConfig.storeName}`}</title>
      <Box>
        <PageBreadcrumbs
          links={[
            { label: product.category.name, to: `/categories/${product.category.id}` },
            { label: product.title, to: `/products/${product.id}` },
          ]}
          current="Enquire"
        />
        <Typography variant="h1">Enquire about this product</Typography>
      </Box>

      {/* A small reminder of the product: picture, name and price */}
      <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="img"
          src={product.imageUrl}
          alt=""
          sx={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0 }}
        />
        <Box>
          <Typography sx={{ fontWeight: 600 }}>{product.title}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{formatPrice(product.price)}</Typography>
        </Box>
      </Paper>

      <Typography>
        Leave your details and our sales team will get back to you about this product.
      </Typography>
      <EnquiryForm
        onSubmit={(details) => sendEnquiry.mutateAsync({ productId: product.id, ...details })}
      />
    </Stack>
  );
}

/**
 * Shown in place of the form once the enquiry has been sent
 * (acceptance criterion: Enquiry → the customer sees a "Thank you" message).
 */
function ThankYouMessage({ product, customerName, customerEmail }) {
  const headingRef = useRef(null);

  // Move keyboard and screen-reader focus to the message, so it is noticed and read out
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 3, md: 5 }, maxWidth: 640, mx: 'auto', textAlign: 'center' }}
    >
      <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 56, mb: 1 }} />
      <Typography
        ref={headingRef}
        tabIndex={-1}
        variant="h1"
        gutterBottom
        // The heading only receives focus from code, so no focus outline is needed
        sx={{ outline: 'none' }}
      >
        Thank you, {customerName}!
      </Typography>
      <Typography sx={{ mb: 3 }}>
        We have received your enquiry about <strong>{product.title}</strong>. Our sales team will
        reply to {customerEmail} soon.
      </Typography>

      {/* Buttons side by side on wider screens, stacked on phones */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
        <Button component={RouterLink} to={`/products/${product.id}`} variant="outlined">
          Back to product
        </Button>
        <Button component={RouterLink} to="/" variant="contained">
          Continue browsing
        </Button>
      </Stack>
    </Paper>
  );
}
