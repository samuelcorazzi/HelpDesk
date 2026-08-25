import type { GetServerSideProps } from 'next';
// Rota inicial: redireciona visitantes à tela de autenticação antes de renderizar.

export default function IndexPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/login',
    permanent: false,
  },
});
