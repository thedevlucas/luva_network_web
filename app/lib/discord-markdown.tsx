// Discord Markdown Parser
// Converts Discord-style markdown to React components

import React from "react";

interface ParsedNode {
  type: string;
  content: string | ParsedNode[];
  language?: string;
  url?: string;
}

// Parse Discord markdown text into an AST
export function parseDiscordMarkdown(text: string): ParsedNode[] {
  const nodes: ParsedNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Code blocks (```language\ncode```)
    const codeBlockMatch = remaining.match(/^```(\w*)\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
      nodes.push({
        type: "codeBlock",
        language: codeBlockMatch[1] || "text",
        content: codeBlockMatch[2],
      });
      remaining = remaining.slice(codeBlockMatch[0].length);
      continue;
    }

    // Inline code (`code`)
    const inlineCodeMatch = remaining.match(/^`([^`]+)`/);
    if (inlineCodeMatch) {
      nodes.push({ type: "inlineCode", content: inlineCodeMatch[1] });
      remaining = remaining.slice(inlineCodeMatch[0].length);
      continue;
    }

    // Headings (# ## ###)
    const headingMatch = remaining.match(/^(#{1,3})\s+(.+?)(?:\n|$)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      nodes.push({
        type: `h${level}`,
        content: parseInline(headingMatch[2]),
      });
      remaining = remaining.slice(headingMatch[0].length);
      continue;
    }

    // Blockquote (> text)
    const blockquoteMatch = remaining.match(/^(?:>\s*(.+?)(?:\n|$))+/);
    if (blockquoteMatch) {
      const lines = blockquoteMatch[0]
        .split("\n")
        .map((line) => line.replace(/^>\s*/, ""))
        .join("\n");
      nodes.push({
        type: "blockquote",
        content: parseInline(lines),
      });
      remaining = remaining.slice(blockquoteMatch[0].length);
      continue;
    }

    // Unordered list (- item or * item)
    const listMatch = remaining.match(/^(?:[-*]\s+.+(?:\n|$))+/);
    if (listMatch) {
      const items = listMatch[0]
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.replace(/^[-*]\s+/, ""));
      nodes.push({
        type: "list",
        content: items.map((item) => ({
          type: "listItem",
          content: parseInline(item),
        })),
      });
      remaining = remaining.slice(listMatch[0].length);
      continue;
    }

    // Links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      nodes.push({
        type: "link",
        content: linkMatch[1],
        url: linkMatch[2],
      });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Newlines
    if (remaining.startsWith("\n\n")) {
      nodes.push({ type: "break", content: "" });
      remaining = remaining.slice(2);
      continue;
    }

    if (remaining.startsWith("\n")) {
      remaining = remaining.slice(1);
      continue;
    }

    // Regular text until special character
    const textMatch = remaining.match(/^[^`#>\[\n*_~|\\-]+/);
    if (textMatch) {
      const inlineNodes = parseInline(textMatch[0]);
      nodes.push(...(Array.isArray(inlineNodes) ? inlineNodes : [inlineNodes]));
      remaining = remaining.slice(textMatch[0].length);
      continue;
    }

    // Inline formatting
    const inlineMatch = remaining.match(/^[\*_~|\\]+[^*_~|\\]+[\*_~|\\]+/);
    if (inlineMatch) {
      const inlineNodes = parseInline(inlineMatch[0]);
      nodes.push(...(Array.isArray(inlineNodes) ? inlineNodes : [inlineNodes]));
      remaining = remaining.slice(inlineMatch[0].length);
      continue;
    }

    // If nothing matches, take one character
    nodes.push({ type: "text", content: remaining[0] });
    remaining = remaining.slice(1);
  }

  return nodes;
}

// Parse inline formatting
function parseInline(text: string): ParsedNode[] {
  const nodes: ParsedNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Bold (**text** or __text__)
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      nodes.push({
        type: "bold",
        content: parseInline(boldMatch[2]),
      });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic (*text* or _text_)
    const italicMatch = remaining.match(/^(\*|_)([^*_]+)\1/);
    if (italicMatch) {
      nodes.push({
        type: "italic",
        content: parseInline(italicMatch[2]),
      });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Underline (__text__) - Discord specific
    const underlineMatch = remaining.match(/^__(.+?)__/);
    if (underlineMatch) {
      nodes.push({
        type: "underline",
        content: parseInline(underlineMatch[1]),
      });
      remaining = remaining.slice(underlineMatch[0].length);
      continue;
    }

    // Strikethrough (~~text~~)
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      nodes.push({
        type: "strike",
        content: parseInline(strikeMatch[1]),
      });
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Spoiler (||text||)
    const spoilerMatch = remaining.match(/^\|\|(.+?)\|\|/);
    if (spoilerMatch) {
      nodes.push({
        type: "spoiler",
        content: parseInline(spoilerMatch[1]),
      });
      remaining = remaining.slice(spoilerMatch[0].length);
      continue;
    }

    // Inline code
    const inlineCodeMatch = remaining.match(/^`([^`]+)`/);
    if (inlineCodeMatch) {
      nodes.push({ type: "inlineCode", content: inlineCodeMatch[1] });
      remaining = remaining.slice(inlineCodeMatch[0].length);
      continue;
    }

    // Link
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      nodes.push({
        type: "link",
        content: linkMatch[1],
        url: linkMatch[2],
      });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Plain text
    const textMatch = remaining.match(/^[^*_~|`\[\]\\]+/);
    if (textMatch) {
      nodes.push({ type: "text", content: textMatch[0] });
      remaining = remaining.slice(textMatch[0].length);
      continue;
    }

    // Single character
    nodes.push({ type: "text", content: remaining[0] });
    remaining = remaining.slice(1);
  }

  return nodes;
}

// Render parsed nodes to React elements
function renderNode(node: ParsedNode, index: number): React.ReactNode {
  const renderChildren = (content: string | ParsedNode[]) => {
    if (typeof content === "string") return content;
    return content.map((child, i) => renderNode(child, i));
  };

  switch (node.type) {
    case "h1":
      return (
        <h1 key={index} className="text-4xl font-display text-white mb-4 mt-8 first:mt-0">
          {renderChildren(node.content)}
        </h1>
      );
    case "h2":
      return (
        <h2 key={index} className="text-3xl font-display text-white mb-3 mt-6 first:mt-0">
          {renderChildren(node.content)}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="text-2xl font-display text-white mb-2 mt-4 first:mt-0">
          {renderChildren(node.content)}
        </h3>
      );
    case "bold":
      return (
        <strong key={index} className="font-bold text-white">
          {renderChildren(node.content)}
        </strong>
      );
    case "italic":
      return (
        <em key={index} className="italic">
          {renderChildren(node.content)}
        </em>
      );
    case "underline":
      return (
        <span key={index} className="underline">
          {renderChildren(node.content)}
        </span>
      );
    case "strike":
      return (
        <del key={index} className="line-through text-gray-500">
          {renderChildren(node.content)}
        </del>
      );
    case "spoiler":
      return (
        <span
          key={index}
          className="bg-gray-600 text-gray-600 hover:bg-transparent hover:text-gray-300 rounded px-1 transition-all cursor-pointer"
        >
          {renderChildren(node.content)}
        </span>
      );
    case "inlineCode":
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 bg-[#2f3136] rounded text-[#eb459e] font-mono text-sm"
        >
          {node.content as string}
        </code>
      );
    case "codeBlock":
      return (
        <pre
          key={index}
          className="my-4 p-4 bg-[#2f3136] rounded-lg overflow-x-auto border border-white/5"
        >
          <code className="text-gray-300 font-mono text-sm">{node.content as string}</code>
        </pre>
      );
    case "blockquote":
      return (
        <blockquote
          key={index}
          className="my-4 pl-4 border-l-4 border-[#965CD9] text-gray-400 italic"
        >
          {renderChildren(node.content)}
        </blockquote>
      );
    case "list":
      return (
        <ul key={index} className="my-4 space-y-2 list-disc list-inside text-gray-300">
          {(node.content as ParsedNode[]).map((item, i) => renderNode(item, i))}
        </ul>
      );
    case "listItem":
      return <li key={index}>{renderChildren(node.content)}</li>;
    case "link":
      return (
        <a
          key={index}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00b0f4] hover:underline"
        >
          {node.content as string}
        </a>
      );
    case "break":
      return <div key={index} className="h-4" />;
    case "text":
    default:
      return <span key={index}>{node.content as string}</span>;
  }
}

// Main component to render Discord markdown
export function DiscordMarkdown({ content }: { content: string }) {
  const nodes = parseDiscordMarkdown(content);

  return (
    <div className="discord-markdown text-gray-300 leading-relaxed">
      {nodes.map((node, i) => renderNode(node, i))}
    </div>
  );
}

// Editor toolbar buttons config
export const markdownButtons = [
  { label: "H1", prefix: "# ", suffix: "", tooltip: "Titulo 1" },
  { label: "H2", prefix: "## ", suffix: "", tooltip: "Titulo 2" },
  { label: "H3", prefix: "### ", suffix: "", tooltip: "Titulo 3" },
  { label: "B", prefix: "**", suffix: "**", tooltip: "Negrita" },
  { label: "I", prefix: "*", suffix: "*", tooltip: "Cursiva" },
  { label: "U", prefix: "__", suffix: "__", tooltip: "Subrayado" },
  { label: "S", prefix: "~~", suffix: "~~", tooltip: "Tachado" },
  { label: ">", prefix: "> ", suffix: "", tooltip: "Cita" },
  { label: "Code", prefix: "`", suffix: "`", tooltip: "Codigo inline" },
  { label: "```", prefix: "```\n", suffix: "\n```", tooltip: "Bloque de codigo" },
  { label: "Link", prefix: "[texto](", suffix: ")", tooltip: "Enlace" },
  { label: "List", prefix: "- ", suffix: "", tooltip: "Lista" },
  { label: "||", prefix: "||", suffix: "||", tooltip: "Spoiler" },
];
