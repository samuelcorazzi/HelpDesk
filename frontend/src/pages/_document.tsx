import { Head, Html, Main, NextScript } from 'next/document';
// Estrutura HTML base renderizada pelo servidor do Next.js.

export default function Document() {
  return (
    <Html lang="pt-BR" data-scroll-behavior="smooth">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
