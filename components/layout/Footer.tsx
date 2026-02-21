import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/lib/constants';

const footerLinks = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Storefront', href: '/dashboard/store' },
    { name: 'Changelog', href: '/#' },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src={siteConfig.logoWordmark}
              alt={siteConfig.name}
              width={140}
              height={34}
              className="h-7 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">
              Product
            </span>
            <ul className="flex items-center gap-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
