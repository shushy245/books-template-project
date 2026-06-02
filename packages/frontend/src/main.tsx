import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';

const root = document.getElementById('root');

if (root === null) {
    throw new Error('main: root element not found — check index.html has <div id="root">');
}

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
