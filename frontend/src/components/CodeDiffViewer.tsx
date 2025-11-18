import { useState, useMemo } from 'react';
import { parseDiff, Diff, Hunk, tokenize } from 'react-diff-view';
import { diffLines, formatLines } from 'unidiff';
import { File, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import clsx from 'clsx';
import 'react-diff-view/style/index.css';

interface CodeDiffViewerProps {
  oldCode: string;
  newCode: string;
  oldPath?: string;
  newPath?: string;
  language?: string;
  viewType?: 'split' | 'unified';
}

export const CodeDiffViewer = ({
  oldCode,
  newCode,
  oldPath = 'old',
  newPath = 'new',
  language = 'javascript',
  viewType = 'split',
}: CodeDiffViewerProps) => {
  const [view, setView] = useState<'split' | 'unified'>(viewType);
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const diffText = useMemo(() => {
    const changes = diffLines(oldCode, newCode);
    return formatLines(changes, { context: 3 });
  }, [oldCode, newCode]);

  const files = useMemo(() => {
    try {
      return parseDiff(diffText, { nearbySequences: 'zip' });
    } catch (err) {
      console.error('Failed to parse diff:', err);
      return [];
    }
  }, [diffText]);

  const tokens = useMemo(() => {
    if (!files.length) return { old: [], new: [] };

    try {
      return tokenize(files[0].hunks);
    } catch (err) {
      console.error('Failed to tokenize:', err);
      return { old: [], new: [] };
    }
  }, [files]);

  const handleCopyDiff = async () => {
    try {
      await navigator.clipboard.writeText(diffText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!files.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No differences found
        </p>
      </div>
    );
  }

  const file = files[0];
  const additions = file.hunks.reduce((sum, hunk) =>
    sum + hunk.changes.filter(c => c.type === 'insert').length, 0
  );
  const deletions = file.hunks.reduce((sum, hunk) =>
    sum + hunk.changes.filter(c => c.type === 'delete').length, 0
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <File className="w-4 h-4 text-gray-500 dark:text-gray-400" />

            <div className="font-mono text-sm">
              <span className="text-gray-500 dark:text-gray-400">{oldPath}</span>
              <span className="mx-2 text-gray-400 dark:text-gray-500">→</span>
              <span className="text-gray-700 dark:text-gray-300">{newPath}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                +{additions}
              </span>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                -{deletions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded overflow-hidden">
              <button
                onClick={() => setView('split')}
                className={clsx(
                  'px-3 py-1 text-xs font-medium transition-colors',
                  view === 'split'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                Split
              </button>
              <button
                onClick={() => setView('unified')}
                className={clsx(
                  'px-3 py-1 text-xs font-medium transition-colors',
                  view === 'unified'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                Unified
              </button>
            </div>

            <button
              onClick={handleCopyDiff}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Copy diff"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Diff Content */}
      {expanded && (
        <div className="overflow-x-auto">
          <Diff
            viewType={view}
            diffType={file.type}
            hunks={file.hunks}
            tokens={tokens}
            renderGutter={({ change }) => {
              const lineNum = (change as any).lineNumber || '';
              if (change.type === 'insert') {
                return (
                  <div className="w-8 text-center text-xs text-green-600 dark:text-green-400">
                    {lineNum}
                  </div>
                );
              }
              if (change.type === 'delete') {
                return (
                  <div className="w-8 text-center text-xs text-red-600 dark:text-red-400">
                    {lineNum}
                  </div>
                );
              }
              return (
                <div className="w-8 text-center text-xs text-gray-400 dark:text-gray-500">
                  {lineNum}
                </div>
              );
            }}
          >
            {(hunks) =>
              hunks.map((hunk) => (
                <Hunk key={hunk.content} hunk={hunk} />
              ))
            }
          </Diff>
        </div>
      )}
    </div>
  );
};

interface MultiFileDiffViewerProps {
  diffs: Array<{
    oldCode: string;
    newCode: string;
    oldPath: string;
    newPath: string;
    language?: string;
  }>;
  viewType?: 'split' | 'unified';
}

export const MultiFileDiffViewer = ({ diffs, viewType = 'split' }: MultiFileDiffViewerProps) => {
  return (
    <div className="space-y-4">
      {diffs.map((diff, index) => (
        <CodeDiffViewer
          key={index}
          oldCode={diff.oldCode}
          newCode={diff.newCode}
          oldPath={diff.oldPath}
          newPath={diff.newPath}
          language={diff.language}
          viewType={viewType}
        />
      ))}
    </div>
  );
};
