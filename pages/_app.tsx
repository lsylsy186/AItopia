// import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { ModelContextProvider } from '@/hooks';
import Providers from '@/components/Providers';

import '@/styles/globals.css';
import '@/styles/style.css';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{}>) {
  const queryClient = new QueryClient();
  return (
    <div className={`${inter.className} h-[100vh] bg-white`}>
      <ModelContextProvider>
        <Providers>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </Providers>
      </ModelContextProvider>
    </div>
  );
}

export default appWithTranslation(App);
