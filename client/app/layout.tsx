import { Poppins, Orbitron } from 'next/font/google';
import './globals.css';

export const metadata = {
  title: 'UNIBÊ Harapan',
  manifest: '/manifest.json',
  themeColor: '#1e4b41',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Harapan Timer',
  },
};

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600'],
  variable: '--font-poppins'
});

const orbitron = Orbitron({ 
  subsets: ['latin'], 
  weight: ['400', '700', '900'],
  variable: '--font-orbitron'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${orbitron.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e4b41" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Harapan Timer" />
      </head>
      <body className="font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                      .then((registration) => {
                        console.log('Service Worker registered:', registration);
                        registration.update();
                      })
                      .catch((error) => {
                        console.error('Service Worker registration failed:', error);
                      });
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}