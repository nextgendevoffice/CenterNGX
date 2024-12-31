import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// สร้าง QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const isLoginPage = Component.name === 'LoginPage';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {isLoginPage ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
} 