// Bootstrapper (ES module): importe l'App et l'initialise quand le DOM est prêt
import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  if (App && typeof App.init === 'function') App.init();
});
