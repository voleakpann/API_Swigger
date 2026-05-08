import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import FirebaseInit from '@/components/FirebaseInit';

export const metadata: Metadata = {
  title: 'CRUD API',
  description: 'Frontend for the CRUD + OTP API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FirebaseInit />
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
