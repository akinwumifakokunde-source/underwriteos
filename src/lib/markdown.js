// Ensures markdown content has real line breaks between blocks so it renders
// correctly. Some LLMs collapse newlines in JSON string fields, producing a
// single line where "##", "###", table rows, and list items sit inline as text.
// Mirrors base44/shared/insights.ts#normalizeMarkdown (kept in sync for the
// public renderer, which runs client-side and cannot import the backend module).
export function normalizeMarkdown(content) {
  if (!content) return "";
  let s = String(content).trim();
  // Blank line before ## and ### headings
  s = s.replace(/([^\n])\s*(#{2,3}\s)/g, "$1\n\n$2");
  // Blank line before numbered list items (1. 2. 3.)
  s = s.replace(/([^\n])\s+(\d+\.\s)/g, "$1\n\n$2");
  // Split pipe-table rows: " | | " marks a row boundary
  s = s.replace(/ \| \| /g, " |\n| ");
  // Blank line before a table that follows a sentence
  s = s.replace(/([.!?])\s+(\|)/g, "$1\n\n$2");
  return s.trim();
}