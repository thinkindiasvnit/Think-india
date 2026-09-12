export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Think India SVNIT",
    "alternateName": "Think India Sardar Vallabhbhai National Institute of Technology",
    "url": "https://thinkindiasvnit.org",
    "logo": "https://thinkindiasvnit.org/logo.png",
    "description": "Student-driven forum promoting nationalistic spirit, civic engagement, and leadership through conclaves, social initiatives, and community service.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Surat",
      "addressRegion": "Gujarat",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-94848-86294",
      "contactType": "General Inquiries"
    },
    "sameAs": [
      "https://www.instagram.com/thinkindia.svnit",
      "https://www.facebook.com/thinkindiasvnit/",
      "https://www.linkedin.com/company/thinkindiaorg/",
      "https://x.com/thinkindiaorg",
      "https://youtube.com/@thinkindiaorg"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Think India SVNIT",
    "url": "https://thinkindiasvnit.org",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://thinkindiasvnit.org/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const educationalOrgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Think India SVNIT",
    "url": "https://thinkindiasvnit.org",
    "logo": "https://thinkindiasvnit.org/logo.png",
    "description": "A forum to bind the youth of India with nationalistic spirit and channelize creative energies towards building a stronger nation through education, innovation, and leadership.",
    "keywords": "youth empowerment, leadership, conclaves, nation building, civic engagement, student forum",
    "alumni": {
      "@type": "Person",
      "name": "Think India Alumni Network"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgSchema) }}
      />
    </>
  );
}
