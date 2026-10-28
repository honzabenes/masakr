"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface LatexPreviewProps {
  content: string;
}

export default function LatexPreview({ content }: LatexPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="min-h-55 w-full rounded-md border border-border bg-muted/20 p-4 text-sm flex items-center justify-center">
        <span className="text-muted-foreground italic">
          Řešení zatím nebylo zadáno...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-55 w-full rounded-md border border-border bg-muted/20 p-4 text-sm leading-relaxed overflow-x-auto space-y-3 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
