import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  theme?: 'vs-dark' | 'light';
}

export const CodeEditor = ({
  value,
  onChange,
  language = 'typescript',
  readOnly = false,
  height = '500px',
  theme = 'vs-dark',
}: Props) => {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          rulers: [80, 120],
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          formatOnPaste: true,
          formatOnType: true,
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }
      />
    </div>
  );
};
