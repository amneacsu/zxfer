import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './style.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Fatal: No DOM root!');
const root = createRoot(rootElement);

root.render(
  <App />,
);
