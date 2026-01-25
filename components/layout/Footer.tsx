import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/lib/constants';

const footerLinks = {
  product: [
    { name: 'Features', href: '/#' },
    { name: 'Pricing', href: '/#' },
    { name: 'Creators', href: '/#' },
  ],
  company: [
    { name: 'About', href: '/#' },
    { name: 'Blog', href: '/#' },
    { name: 'Careers', href: '/#' },
  ],
  support: [
    { name: 'Help Center', href: '/#' },
    { name: 'Contact', href: '/#' },
    { name: 'Privacy', href: '/#' },
    { name: 'Terms', href: '/#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 text-sm text-text-secondary">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-text-secondary text-center">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
