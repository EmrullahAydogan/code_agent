import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // bytes
  multiple?: boolean;
}

export const FileUpload = ({
  onFilesSelected,
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
}: Props) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-blue-500 bg-blue-50',
          isDragReject && 'border-red-500 bg-red-50',
          !isDragActive && 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} />

        <Upload
          className={clsx(
            'w-12 h-12 mx-auto mb-4',
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          )}
        />

        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              {multiple
                ? `Up to ${maxFiles} files, max ${(maxSize / 1024 / 1024).toFixed(0)}MB each`
                : `Max ${(maxSize / 1024 / 1024).toFixed(0)}MB`}
            </p>
          </>
        )}
      </div>

      {/* Accepted Files */}
      {acceptedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          {acceptedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded"
            >
              <File className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-900 flex-1 truncate">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Rejected Files */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-700">Rejected Files:</h4>
          {fileRejections.map(({ file, errors }, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded"
            >
              <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{file.name}</p>
                {errors.map((error) => (
                  <p key={error.code} className="text-xs text-red-600">
                    {error.message}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
