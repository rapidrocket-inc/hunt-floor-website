import { SITE_URL, SITE_NAME, TAGLINE, DESCRIPTION, PUBLISHER, FAQS } from "@/lib/seo";

// Server component — emits JSON-LD in the initial HTML (no JS needed to read it).
export default function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: DESCRIPTION,
        logo: `${SITE_URL}/icon`,
        sameAs: [PUBLISHER.url],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: TAGLINE,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: DESCRIPTION,
        publisher: {
          "@type": "Organization",
          name: PUBLISHER.name,
          url: PUBLISHER.url,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
