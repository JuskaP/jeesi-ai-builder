import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://jeesi.ai/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);

    // Robots
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Open Graph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:site_name', 'Jeesi.ai', true);
    if (canonicalUrl) {
      updateMeta('og:url', canonicalUrl, true);
    }

    // Twitter
    updateMeta('twitter:card', twitterCard);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
    updateMeta('twitter:site', '@jeesi_ai');

    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonicalElement) {
        canonicalElement = document.createElement('link');
        canonicalElement.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.setAttribute('href', canonicalUrl);
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      let scriptElement = document.querySelector('script[data-seo="structured-data"]');
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        scriptElement.setAttribute('data-seo', 'structured-data');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    }

    // Cleanup on unmount
    return () => {
      const structuredDataScript = document.querySelector('script[data-seo="structured-data"]');
      if (structuredDataScript) {
        structuredDataScript.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, twitterCard, noIndex, structuredData]);
}

// Predefined SEO configurations for pages
export const SEO_CONFIG = {
  home: {
    title: 'Jeesi.ai - No-Code AI Agent Builder for Business Automation',
    description: 'Build powerful AI agents without coding. Jeesi.ai helps SMEs automate customer service, sales, and operations with custom AI tools. Start free today.',
    keywords: 'AI agent builder, no-code AI, AI automation, business AI, AI chatbot, AI tools for SMEs, AI website builder, custom AI agents',
    canonicalUrl: 'https://jeesi.ai/',
  },
  dashboard: {
    title: 'My AI Agents - Jeesi.ai Dashboard',
    description: 'Manage, test, and deploy your custom AI agents. Monitor performance, configure settings, and scale your AI automation from one dashboard.',
    keywords: 'AI agent dashboard, manage AI agents, AI automation dashboard, deploy AI agents',
    canonicalUrl: 'https://jeesi.ai/dashboard',
  },
  community: {
    title: 'AI Agent Templates & Community - Jeesi.ai',
    description: 'Discover and share AI agent templates with the Jeesi.ai community. Browse pre-built agents for marketing, sales, customer service, and more.',
    keywords: 'AI agent templates, AI community, share AI agents, pre-built AI, AI marketplace',
    canonicalUrl: 'https://jeesi.ai/community',
  },
  billing: {
    title: 'Pricing & Plans - Jeesi.ai AI Agent Builder',
    description: 'Simple, transparent pricing for AI agent building. Start free with 50 credits. Pro plans from €19/month. No hidden fees, cancel anytime.',
    keywords: 'AI agent pricing, AI builder cost, Jeesi.ai pricing, AI SaaS pricing, AI subscription',
    canonicalUrl: 'https://jeesi.ai/billing',
  },
  blog: {
    title: 'AI Insights & Guides - Jeesi.ai Blog',
    description: 'Learn how to build better AI agents, automate business processes, and stay ahead with AI trends. Expert guides and tutorials.',
    keywords: 'AI blog, AI guides, AI tutorials, AI automation tips, AI agent best practices',
    canonicalUrl: 'https://jeesi.ai/blog',
  },
  auth: {
    title: 'Sign In or Create Account - Jeesi.ai',
    description: 'Access your Jeesi.ai account to build and manage AI agents. New users can create a free account and start building immediately.',
    keywords: 'Jeesi.ai login, create AI account, sign in AI builder',
    canonicalUrl: 'https://jeesi.ai/auth',
  },
  workspaces: {
    title: 'Team Workspaces - Jeesi.ai Collaboration',
    description: 'Collaborate on AI agents with your team. Create workspaces, invite members, and build AI solutions together.',
    keywords: 'AI team collaboration, AI workspaces, team AI builder, collaborative AI',
    canonicalUrl: 'https://jeesi.ai/workspaces',
  },
  profile: {
    title: 'My Profile - Jeesi.ai',
    description: 'Manage your Jeesi.ai profile, API keys, and account settings. View usage statistics and customize your AI building experience.',
    keywords: 'AI profile, account settings, API keys, AI usage',
    canonicalUrl: 'https://jeesi.ai/profile',
  },
  terms: {
    title: 'Terms of Service - Jeesi.ai',
    description: 'Read our terms of service for using the Jeesi.ai AI agent building platform. Understand your rights and responsibilities.',
    keywords: 'terms of service, legal terms, AI platform terms',
    canonicalUrl: 'https://jeesi.ai/terms',
  },
  privacy: {
    title: 'Privacy Policy - Jeesi.ai',
    description: 'Learn how Jeesi.ai protects your data and privacy. Our commitment to GDPR compliance and data security.',
    keywords: 'privacy policy, data protection, GDPR, AI privacy',
    canonicalUrl: 'https://jeesi.ai/privacy',
  },
};

// JSON-LD Schemas
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Jeesi.ai',
  url: 'https://jeesi.ai',
  logo: 'https://jeesi.ai/logo.png',
  sameAs: [
    'https://twitter.com/jeesi_ai',
    'https://linkedin.com/company/jeesi-ai',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
});

export const getSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Jeesi.ai',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    priceValidUntil: '2025-12-31',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
  },
  description: 'No-code AI agent builder for business automation. Create custom AI chatbots, automate customer service, and scale your operations.',
});

export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified,
  author: {
    '@type': 'Person',
    name: article.author,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Jeesi.ai',
    logo: {
      '@type': 'ImageObject',
      url: 'https://jeesi.ai/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

export const getWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: page.name,
  description: page.description,
  url: page.url,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Jeesi.ai',
    url: 'https://jeesi.ai',
  },
});
