import React, { useEffect } from 'react';

const SEO = ({ title, description, image, url, article }) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} | SanWater`;
        }

        const updateMeta = (name, content, property = false) => {
            if (!content) return;
            const attr = property ? 'property' : 'name';
            let element = document.querySelector(`meta[${attr}="${name}"]`);
            if (element) {
                element.setAttribute('content', content);
            } else {
                element = document.createElement('meta');
                element.setAttribute(attr, name);
                element.setAttribute('content', content);
                document.head.appendChild(element);
            }
        };

        updateMeta('description', description);
        updateMeta('og:title', title, true);
        updateMeta('og:description', description, true);
        updateMeta('og:image', image, true);
        updateMeta('og:url', url, true);
        updateMeta('og:type', article ? 'article' : 'website', true);
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', title);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', image);

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (url) {
            if (canonical) {
                canonical.setAttribute('href', url);
            } else {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                canonical.setAttribute('href', url);
                document.head.appendChild(canonical);
            }
        }

        // Structured Data (JSON-LD)
        if (article) {
            const structuredData = {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": title,
                "image": [image],
                "datePublished": article.publishedAt || article.createdAt,
                "dateModified": article.updatedAt || article.createdAt,
                "author": [{
                    "@type": "Person",
                    "name": article.author || "SanWater Team"
                }]
            };

            let script = document.querySelector('script[type="application/ld+json"]');
            if (script) {
                script.textContent = JSON.stringify(structuredData);
            } else {
                script = document.createElement('script');
                script.setAttribute('type', 'application/ld+json');
                script.textContent = JSON.stringify(structuredData);
                document.head.appendChild(script);
            }
        }
    }, [title, description, image, url, article]);

    return null;
};

export default SEO;
