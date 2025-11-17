import { useState } from 'react';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
  children?: FileNode[];
}

interface FileBrowserProps {
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  selectedPath?: string;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  files,
  onFileSelect,
  selectedPath,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Files</h3>
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        {files.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            level={0}
            onSelect={onFileSelect}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
};

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  onSelect?: (file: FileNode) => void;
  selectedPath?: string;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  level,
  onSelect,
  selectedPath,
}) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    }
    onSelect?.(node);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      js: '📄',
      jsx: '⚛️',
      ts: '📘',
      tsx: '⚛️',
      json: '📋',
      md: '📝',
      css: '🎨',
      scss: '🎨',
      html: '🌐',
      vue: '💚',
      py: '🐍',
      rs: '🦀',
      go: '🔵',
      java: '☕',
    };
    return icons[ext || ''] || '📄';
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors',
          isSelected && 'bg-purple-50'
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {node.type === 'directory' && (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </span>
        )}
        {node.type === 'directory' ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          )
        ) : (
          <span className="flex-shrink-0">{getFileIcon(node.name)}</span>
        )}
        <span
          className={clsx(
            'text-sm truncate',
            isSelected ? 'text-purple-700 font-medium' : 'text-gray-700'
          )}
        >
          {node.name}
        </span>
        {node.size !== undefined && (
          <span className="text-xs text-gray-400 ml-auto">
            {formatFileSize(node.size)}
          </span>
        )}
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
