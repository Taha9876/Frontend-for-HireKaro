import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import ConditionalNavbar from '@/components/Conditionalnavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import GoogleTranslateProvider from '@/components/GoogleTranslateProvider';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'opsz'],
});

export const metadata = {
  title: 'Hire Karo — AI Powered Hiring',
  description: 'Automate resume screening and interviews with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <body className={plusJakarta.className} suppressHydrationWarning>
        <GoogleTranslateProvider />
        <ConditionalNavbar />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}