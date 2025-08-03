import React, { useRef, useState } from 'react';
import { Upload, X, Download, FileText, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { UploadedFile } from '../../types';
import { handleFileUpload, downloadFile, formatFileSize } from '../../utils/fileUtils';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function FileUpload({ 
  files, 
  onFilesChange, 
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  multiple = true,
  className = ""
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    try {
      const uploadPromises = selectedFiles.map(file => handleFileUpload(file));
      const uploadedFiles = await Promise.all(uploadPromises);
      onFilesChange([...files, ...uploadedFiles]);
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const isImage = (file: UploadedFile) => {
    return file.type.startsWith('image/');
  };

  const isPDF = (file: UploadedFile) => {
    return file.type === 'application/pdf';
  };

  const renderFilePreview = (file: UploadedFile) => {
    if (isImage(file)) {
      return (
        <div className="relative">
          <div className="max-w-full max-h-[50vh] overflow-hidden rounded-lg cursor-pointer group" onClick={() => setExpandedImage(file.data)}>
            <img
              src={file.data}
              alt={file.name}
              className="w-full h-[50vh] object-contain group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      );
    } else if (isPDF(file)) {
      return (
        <div className="w-full h-[50vh] border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">PDF Preview</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-[50vh] bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Preview not available</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={className}>
      {files.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Click to upload files or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, Images, Documents
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add More Files Button */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{files.length} file{files.length > 1 ? 's' : ''} uploaded</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add More Files
            </button>
          </div>
          
          {/* File List with Inline Previews */}
          <div className="space-y-4">
            {files.map(file => (
              <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* File Header */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center flex-1 min-w-0">
                    {isImage(file) ? (
                      <ImageIcon className="w-5 h-5 text-blue-600 mr-3" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-600 mr-3" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* File Preview */}
                <div className="p-3 bg-white">
                  {renderFilePreview(file)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm" onClick={() => setExpandedImage(null)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={expandedImage}
              alt="Expanded preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}