import React from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Primetrade.ai - Enterprise Task Hub',
  description: 'Secure, real-time task manager and intern evaluation dashboard with role-based access control.',
  keywords: 'task manager, secure dashboard, role-based access control, primetrade.ai, project management',
  authors: [{ name: 'Senior Full-Stack Engineer' }],
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans select-none">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
