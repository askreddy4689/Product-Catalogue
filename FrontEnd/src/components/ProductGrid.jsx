import { useId } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { formatPrice } from '../utils/formatPrice';

/**
 * Product tiles in a grid: two across on phones; on bigger screens, as many 200px-wide
 * tiles as fit (five across on a desktop). With a `title`, it becomes a titled section
 * (e.g. "Top rated"), which screen readers announce by that name.
 */
export default function ProductGrid({ products, title }) {
  const headingId = useId();

  const grid = (
    <Box
      component="ul"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(auto-fill, minmax(200px, 1fr))',
        },
      }}
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductTile product={product} />
        </li>
      ))}
    </Box>
  );

  if (!title) return grid;
  return (
    <Box component="section" aria-labelledby={headingId}>
      <Typography id={headingId} variant="h2" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {grid}
    </Box>
  );
}

// Shows at most two lines of the product name; longer names end with "…".
// The minimum height keeps tiles lined up when a name fits on one line.
const TWO_LINES_AT_MOST = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.4,
  minHeight: '2.8em',
};

/**
 * A product card: picture, name, rating and price (acceptance criterion: Product page).
 * The whole card is one link to the product's details page.
 */
function ProductTile({ product }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        component={RouterLink}
        to={`/products/${product.id}`}
        // Stack picture, name, rating and price from top to bottom, filling the card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        {/* The picture is decorative here (alt=""): the product name is right below it */}
        <CardMedia
          component="img"
          image={product.imageUrl}
          alt=""
          loading="lazy"
          sx={{ height: 180, objectFit: 'contain', p: 2, bgcolor: 'common.white' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography component="h3" variant="subtitle1" sx={TWO_LINES_AT_MOST}>
            {product.title}
          </Typography>
          <ProductRating rating={product.rating} size="small" />
          {/* mt: 'auto' pushes the price to the bottom, so prices line up along a row */}
          <Typography sx={{ mt: 'auto', fontWeight: 700, fontSize: '1.125rem' }}>
            {formatPrice(product.price)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/** Stars plus the numbers, e.g. ★★★★½ 4.7 (500 reviews). */
export function ProductRating({ rating, size = 'medium' }) {
  const reviews = rating.count === 1 ? 'review' : 'reviews';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
      <Rating value={rating.average} precision={0.1} size={size} readOnly />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {rating.average.toFixed(1)} ({rating.count} {reviews})
      </Typography>
    </Box>
  );
}
