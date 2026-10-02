'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import styles from './application-shell.module.css';

const destinations = [
  { label: 'Home', href: '/', section: 'home' },
  { label: 'Learning', href: '/#learning', section: 'learning' },
  { label: 'How it works', href: '/onboarding', section: 'onboarding' },
  { label: 'Account', href: '/account', section: 'account' },
] as const;

function usesProductionShell(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/onboarding' ||
    pathname === '/account' ||
    pathname === '/feedback' ||
    pathname.startsWith('/journeys/')
  );
}

function currentSection(pathname: string): string | undefined {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/journeys/')) return 'learning';
  if (pathname === '/onboarding') return 'onboarding';
  if (pathname === '/account') return 'account';
  return undefined;
}

export function ApplicationShell({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [menuOpen]);

  if (!usesProductionShell(pathname)) return <>{children}</>;

  const active = currentSection(pathname);
  const links = destinations.map(({ label, href, section }) => (
    <Link
      key={section}
      href={href}
      aria-current={active === section ? 'page' : undefined}
      className={styles.navLink}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  ));

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="CodeQuest home"
          onClick={() => setMenuOpen(false)}
        >
          <CodeQuestLogo />
        </Link>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {links}
        </nav>
        <button
          ref={menuButton}
          type="button"
          className={styles.menuButton}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>
      <nav
        id="mobile-navigation"
        className={styles.mobileNav}
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        {links}
      </nav>
      <div id="main-content" tabIndex={-1} className={styles.content}>
        {children}
      </div>
    </div>
  );
}
