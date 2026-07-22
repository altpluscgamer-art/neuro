export function formatContent(text: string): string {
  // Escape HTML to prevent XSS
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  // Convert newlines to <br>
  return escaped.replace(/\n/g, "<br>");
}
