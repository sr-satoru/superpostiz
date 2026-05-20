import { ReactNode } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import clsx from 'clsx';
import Link from 'next/link';
import '../global.scss';
import './termos.scss';

const jakartaSans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export default function TermosLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={clsx(jakartaSans.className, 'dark')}>
        <div className="termos-layout">
          <header className="termos-header">
            <Link href="/auth/login" className="termos-header__logo">
              <svg width="84" height="30" viewBox="0 0 84 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="23" fontFamily="inherit" fontWeight="800" fontSize="26" fill="#ffffff" letterSpacing="-1.5">Labs</text>
                <circle cx="68" cy="8" r="4" fill="#fc69ff" />
              </svg>
            </Link>

            <nav className="termos-header__nav">
              <Link href="/terms">Termos de Serviço</Link>
              <Link href="/privacy">Privacidade</Link>
            </nav>

            <Link href="/auth/login" className="termos-header__back-btn">
              Voltar para Login
            </Link>
          </header>

          <main className="termos-main">
            <div className="termos-content">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
