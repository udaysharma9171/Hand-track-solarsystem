// import './style.css'; // Removed as file was deleted
// We can just inject basic CSS here or assume HUD handles it.
// Let's add a basic reset style to body.

const style = document.createElement('style');
style.textContent = `
  body { margin: 0; overflow: hidden; background: #000; }
  canvas { display: block; }
`;
document.head.appendChild(style);

import { App } from './core/App.js';

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
