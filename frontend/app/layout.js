import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ConditionalNavbar from '@/components/Conditionalnavbar';
import ConditionalFooter from '@/components/ConditionalFooter';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata = {
  title: 'Brain-A-Hire — AI Powered Hiring',
  description: 'Automate resume screening and interviews with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={plusJakarta.className} suppressHydrationWarning>
        <ConditionalNavbar />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}