import { Poppins, Orbitron } from 'next/font/google';
import './globals.css';

export const metadata = {
  title: 'UNIBÊ Harapan',
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
      <body className="font-sans">{children}</body>
    </html>
  );
}