/* Versioned entry point: SillyTavern may cache an extension's module URL
   across ordinary reloads. A new loader filename per release guarantees that
   the updated index module and its matching CSS are fetched together. */
import './index.js?v=2.0.9';
