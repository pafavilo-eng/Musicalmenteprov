import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { pwaUpdateService } from './services/pwaUpdateService';

// Inicializa o gerenciador de atualização automática da PWA
pwaUpdateService.init();

createRoot(document.getElementById('root')!).render(<App />);
