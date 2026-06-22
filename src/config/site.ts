/**
 * Site configuration
 */
export const siteConfig = {
  name: 'EasyPDFNex',
  description: 'Professional PDF Tools - Free, Private & Browser-Based. Merge, split, compress, convert, and edit PDF files online without uploading to servers.',
  url: 'https://easypdfnex.app',
  ogImage: '/images/og-image.png',
  links: {
    github: 'https://github.com/EasyPDFNex/easypdfnex',
    twitter: 'https://twitter.com/easypdfnex',
  },
  creator: 'EasyPDFNex Team',
  keywords: [
    'PDF tools',
    'PDF editor',
    'merge PDF',
    'split PDF',
    'compress PDF',
    'convert PDF',
    'free PDF tools',
    'online PDF editor',
    'browser-based PDF',
    'private PDF processing',
  ],
  // SEO-related settings
  seo: {
    titleTemplate: '%s | EasyPDFNex',
    defaultTitle: 'EasyPDFNex - Professional PDF Tools',
    twitterHandle: '@easypdfnex',
    locale: 'en_US',
  },
};

/**
 * Navigation configuration
 */
export const navConfig = {
  mainNav: [
    { title: 'Home', href: '/' },
    { title: 'Tools', href: '/tools' },
    { title: 'About', href: '/about' },
    { title: 'FAQ', href: '/faq' },
  ],
  footerNav: [
    { title: 'Privacy', href: '/privacy' },
    { title: 'Contact', href: '/contact' },
  ],
};
