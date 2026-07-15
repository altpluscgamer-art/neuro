interface SEOHeadProps {
  type: "website" | "article" | "service" | "course";
  title: string;
  description: string;
  url?: string;
  image?: string;
  datePublished?: string;
  author?: string;
  price?: number;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neuro-online.ru";

function buildJsonLd(props: SEOHeadProps) {
  const base = {
    "@context": "https://schema.org",
  };

  const imageUrl = props.image?.startsWith("http")
    ? props.image
    : props.image
      ? `${SITE_URL}${props.image}`
      : undefined;

  const pageUrl = props.url?.startsWith("http")
    ? props.url
    : props.url
      ? `${SITE_URL}${props.url}`
      : undefined;

  switch (props.type) {
    case "website":
      return {
        ...base,
        "@type": "WebSite",
        name: props.title,
        description: props.description,
        url: pageUrl ?? SITE_URL,
        ...(imageUrl && { image: imageUrl }),
        inLanguage: "ru",
      };

    case "article":
      return {
        ...base,
        "@type": "Article",
        headline: props.title,
        description: props.description,
        url: pageUrl,
        ...(imageUrl && { image: imageUrl }),
        inLanguage: "ru",
        ...(props.datePublished && {
          datePublished: props.datePublished,
        }),
        ...(props.author && {
          author: {
            "@type": "Person",
            name: props.author,
          },
        }),
        publisher: {
          "@type": "Organization",
          name: "Нейро",
          url: SITE_URL,
        },
      };

    case "service":
      return {
        ...base,
        "@type": "Service",
        name: props.title,
        description: props.description,
        url: pageUrl,
        ...(imageUrl && { image: imageUrl }),
        provider: {
          "@type": "Person",
          name: props.author ?? "Мария Иванова",
          jobTitle: "Детский нейропсихолог",
        },
        areaServed: {
          "@type": "Country",
          name: "Россия",
        },
      };

    case "course":
      return {
        ...base,
        "@type": "Course",
        name: props.title,
        description: props.description,
        url: pageUrl,
        ...(imageUrl && { image: imageUrl }),
        provider: {
          "@type": "Organization",
          name: "Нейро",
          url: SITE_URL,
        },
        ...(typeof props.price === "number" && {
          offers: {
            "@type": "Offer",
            price: props.price,
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
          },
        }),
        inLanguage: "ru",
      };
  }
}

export default function SEOHead(props: SEOHeadProps) {
  const jsonLd = buildJsonLd(props);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
