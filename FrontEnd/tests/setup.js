// Runs before every test file.
import { TextDecoder, TextEncoder } from 'node:util';

// Adds readable checks such as expect(element).toBeInTheDocument()
import '@testing-library/jest-dom';

// jsdom (the simulated browser Jest uses) lacks two browser features the app relies on:
//  - TextEncoder/TextDecoder, which React Router uses: borrow Node's versions.
//  - Scrolling, which ScrollToTop uses on every page change: give it a version that does nothing.
Object.assign(globalThis, { TextEncoder, TextDecoder });
window.scrollTo = () => {};
