'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavLinkItem {
  label: string;
  href: string;
}

interface ActionItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface MiniNavbarProps {
  links?: NavLinkItem[];
  actions?: ActionItem[];
  brand?: React.ReactNode;
  showGlyph?: boolean;
}

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-text-secondary';
  const hoverTextColor = 'text-foreground';
  const textSizeClass = 'text-sm';

  return (
    <a href={href} className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass}`}>
      <div className="flex flex-col transition-transform duration-300 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </a>
  );
};

export function MiniNavbar({ links = [], actions = [], brand, showGlyph = true }: MiniNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const logoElement = (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <span className="absolute w-1.5 h-1.5 rounded-full bg-foreground top-0 left-1/2 transform -translate-x-1/2 opacity-80" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-foreground left-0 top-1/2 transform -translate-y-1/2 opacity-80" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-foreground right-0 top-1/2 transform -translate-y-1/2 opacity-80" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-foreground bottom-0 left-1/2 transform -translate-x-1/2 opacity-80" />
    </div>
  );

  return (
    <header
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-20
        flex flex-col items-center
        pl-5 pr-5 py-2.5 backdrop-blur-xl
        ${isOpen ? 'rounded-xl' : 'rounded-full'}
        border border-border bg-card/90
        w-[calc(100%-2rem)] sm:w-auto
        transition-[border-radius] duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
        <div className="flex items-center gap-2">
          {showGlyph ? logoElement : null}
          {brand}
        </div>

        <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm">
          {links.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {actions.map((action) => {
            const className =
              'px-4 py-2 sm:px-3 text-xs sm:text-sm border border-border bg-background text-text-secondary rounded-full hover:border-primary/50 hover:text-foreground transition-colors duration-200 w-full sm:w-auto';

            if (action.href) {
              return (
                <Link key={action.label} href={action.href} className={className}>
                  {action.label}
                </Link>
              );
            }

            return (
              <button key={action.label} onClick={action.onClick} className={className}>
                {action.label}
              </button>
            );
          })}
        </div>

        <button
          className="sm:hidden flex items-center justify-center w-8 h-8 text-text-secondary focus:outline-none"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
          ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}
      >
        {links.length > 0 && (
          <nav className="flex flex-col items-center space-y-4 text-base w-full">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="text-text-secondary hover:text-foreground transition-colors w-full text-center">
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex flex-col items-center space-y-3 mt-4 w-full">
          {actions.map((action) => {
            const className =
              'px-4 py-2 text-sm border border-border bg-background text-text-secondary rounded-full hover:border-primary/50 hover:text-foreground transition-colors duration-200 w-full text-center';

            if (action.href) {
              return (
                <Link key={action.label} href={action.href} className={className}>
                  {action.label}
                </Link>
              );
            }

            return (
              <button key={action.label} onClick={action.onClick} className={className}>
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
