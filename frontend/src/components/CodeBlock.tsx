import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e] my-4">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-300 font-mono">{filename}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      {!filename && (
        <div className="flex justify-end px-2 py-1 bg-gray-800">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          background: '#1e1e1e',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// Inline code component
interface InlineCodeProps {
  children: string;
}

export const InlineCode: React.FC<InlineCodeProps> = ({ children }) => {
  return (
    <code className="px-1.5 py-0.5 bg-gray-800 text-pink-400 rounded text-sm font-mono">
      {children}
    </code>
  );
};

// Parse message content and render code blocks
interface MessageContentProps {
  content: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose prose-invert max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
          if (match) {
            const language = match[1] || 'text';
            const code = match[2].trim();
            return <CodeBlock key={index} code={code} language={language} />;
          }
        }

        // Parse inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <p key={index} className="text-sm text-gray-200 whitespace-pre-wrap">
            {inlineParts.map((inlinePart, i) => {
              if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
                return <InlineCode key={i}>{inlinePart.slice(1, -1)}</InlineCode>;
              }
              return inlinePart;
            })}
          </p>
        );
      })}
    </div>
  );
};
