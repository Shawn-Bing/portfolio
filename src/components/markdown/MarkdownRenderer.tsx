import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import type { Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    const { createHighlighter } = await import("shiki");
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: ["typescript", "javascript", "python", "css", "html", "json", "bash", "tsx", "jsx", "rust", "go", "java", "markdown"],
    });
  }
  return highlighterPromise;
}

async function highlightCode(code: string, lang: string): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    const language = highlighter.getLoadedLanguages().includes(lang) ? lang : "text";
    return highlighter.codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    });
  } catch {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function renderMarkdown(md: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeKatex, { output: "htmlAndMathml" })
    .use(rehypeStringify);

  const result = await processor.process(md);
  let html = String(result);

  // Syntax highlight code blocks
  const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
  const matches: Array<{ full: string; lang: string; code: string }> = [];
  let match;
  while ((match = codeBlockRegex.exec(html)) !== null) {
    matches.push({ full: match[0], lang: match[1], code: match[2] });
  }

  for (const m of matches) {
    const decoded = m.code
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"');
    const highlighted = await highlightCode(decoded, m.lang);
    html = html.replace(m.full, highlighted);
  }

  return html;
}
