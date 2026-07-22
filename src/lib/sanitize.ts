import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html; // SSR — sanitize on client
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ul", "ol", "li", "h2", "h3", "h4", "a", "span", "div"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}
