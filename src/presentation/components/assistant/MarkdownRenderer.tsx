/**
 * VikiMedic v2 - Markdown & Rich Text Chat Message Renderer
 * Clean Architecture Layer: Presentation
 * AI Patch 01 - Viki Assistant Online Mode
 */

import React, { useState } from 'react';
import { Copy, Check, Code, FileText } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  if (!content) return null;

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Helper function to process inline formatting (bold, italic, inline code)
  const renderInline = (text: string) => {
    // Regex for bold **text**, italic *text*, inline code `code`
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[var(--text-main)]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-300 font-mono text-[10px] border border-slate-700 mx-0.5"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Parse code blocks (```lang ... ```)
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const blocks: { type: 'text' | 'code' | 'table'; content: string; language?: string }[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: content.substring(lastIndex, match.index) });
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({ type: 'text', content: content.substring(lastIndex) });
  }

  return (
    <div className="space-y-2 text-xs leading-relaxed break-words dir-rtl">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          const isCopied = copiedCodeIndex === idx;
          return (
            <div
              key={idx}
              className="my-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden dir-ltr font-mono text-[11px]"
            >
              <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                <span className="flex items-center gap-1 font-bold text-slate-300">
                  <Code className="w-3 h-3 text-blue-400" />
                  <span>{block.language || 'code'}</span>
                </span>
                <button
                  onClick={() => handleCopyCode(block.content, idx)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 transition"
                  title="کپی کد"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>کپی</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-slate-200 leading-normal font-mono whitespace-pre-wrap">
                {block.content}
              </pre>
            </div>
          );
        }

        // Render regular text blocks with line breaks, bullet lists, tables
        const lines = block.content.split('\n');

        return (
          <div key={idx} className="space-y-1">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();

              if (!trimmed) {
                return <div key={lineIdx} className="h-1" />;
              }

              // Headings (# Heading)
              if (trimmed.startsWith('#')) {
                const level = trimmed.match(/^#+/)?.[0].length || 1;
                const headingText = trimmed.replace(/^#+\s*/, '');
                return (
                  <div
                    key={lineIdx}
                    className={`font-bold mt-2 mb-1 text-[var(--text-main)] ${
                      level === 1 ? 'text-sm text-blue-400 border-b border-blue-500/20 pb-1' : 'text-xs text-indigo-300'
                    }`}
                  >
                    {renderInline(headingText)}
                  </div>
                );
              }

              // Lists (- or * or 1.)
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
                const isOrdered = /^\d+\.\s/.test(trimmed);
                const listText = trimmed.replace(/^([-*]|\d+\.)\s*/, '');
                return (
                  <div key={lineIdx} className="flex items-start gap-2 my-0.5 pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span className="flex-1 text-[11px]">{renderInline(listText)}</span>
                  </div>
                );
              }

              // Table rows simple support (| col1 | col2 |)
              if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                const cells = trimmed
                  .split('|')
                  .filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1)
                  .map((c) => c.trim());

                // Skip separator rows (|---|---|)
                if (cells.every((c) => /^:?-+:?$/.test(c))) {
                  return null;
                }

                return (
                  <div key={lineIdx} className="grid grid-flow-col auto-cols-fr gap-1 bg-slate-900/40 p-1.5 rounded border border-slate-800 text-[10px] my-0.5">
                    {cells.map((cell, cIdx) => (
                      <div key={cIdx} className="px-1 text-center font-medium border-l border-slate-800 last:border-0">
                        {renderInline(cell)}
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <p key={lineIdx} className="leading-relaxed">
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
