import { createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(createElement(StrictMode, null, createElement(App)));
