import type { AppProps } from 'next/app';
// Ponto global do Next.js: carrega estilos compartilhados para todas as páginas.
import '@/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
