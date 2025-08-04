import React, { useState, useCallback } from 'react';
import { Upload, FileText, Briefcase, CheckCircle, AlertCircle, Loader, X, Info } from 'lucide-react';
import axios from 'axios';

interface FileUploadProps {
  title: string;
  accept: string;
  icon: 'resume' | 'job';
  onFileSelect: (file: File) => void;
  onUploadComplete?: (result: any) => void;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}


const FileUpload: React.FC<FileUploadProps> = ({ 
  title, 
  accept, 
  icon, 
  onFileSelect, 
  onUploadComplete 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({loaded: 0, total: 0, percentage: 0});
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // File validation
  const validateFile = useCallback((file: File): string[] => {
    const errors: string[] = [];
    const maxSize = parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '16777216'); // 16MB
    const supportedFormats = (process.env.REACT_APP_SUPPORTED_FORMATS || 'pdf,docx,doc').split(',');
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      errors.push(`Supported formats: ${supportedFormats.join(', ').toUpperCase()}`);
    }
    
    // Check file name length
    if (file.name.length > 255) {
      errors.push('Filename too long (max 255 characters)');
    }
    
    // Check for special characters in filename
    if (!/^[a-zA-Z0-9._\-\s]+$/.test(file.name)) {
      errors.push('Filename contains invalid characters');
    }
    
    return errors;
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  },[]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
    e.target.value = '';
  },[]);

  const handleFileSelection = useCallback(async (file: File) => {
    const errors = validateFile(file);
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      setError('File validation failed');
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploadResult(null);
    setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
    onFileSelect(file);

    if (icon === 'resume') {
      await uploadResume(file);
    }
  },[validateFile, onFileSelect, icon]);

  const uploadResume = async (file: File) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/upload-resume`,
        formData, {
            headers: {
            'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percentage = total ? Math.round((loaded * 100) / total) : 0;
            setUploadProgress({ loaded, total: total || 0, percentage });
          },
          timeout: 30000, // 30 second timeout
          
      });
      console.log(process.env.REACT_APP_API_BASE_URL);

      console.log(`${process.env.REACT_APP_API_BASE_URL}/upload-resume`);


      setUploadResult(response.data);
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (err: any) {
      let errorMessage = 'Upload failed';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout - file may be too large';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
    }
  };

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
    setError('');
    setValidationErrors([]);
    setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
  }, []);


  const IconComponent = icon === 'resume' ? FileText : Briefcase;

  const getStatusIcon = () => {
    if (uploading) return <Loader className="animate-spin text-blue-500" size={20} />;
    if (error || validationErrors.length > 0) return <AlertCircle className="text-red-500" size={20} />;
    if (uploadResult) return <CheckCircle className="text-green-500" size={20} />;
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${dragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : error || validationErrors.length > 0
            ? 'border-red-500 bg-red-50'
            : uploadResult
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <IconComponent
          className={`
            mx-auto mb-4 transition-colors
            ${error || validationErrors.length > 0
              ? 'text-red-500'
              : uploadResult
              ? 'text-green-500'
              : 'text-gray-400'
            }
          `}
          size={48}
        />

        {/* File Info or Drag Message */}
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">
              {selectedFile ? selectedFile.name : 'Drop your file here, or'}
            </p>
            {selectedFile && (
              <div className="text-xs text-gray-400 space-y-1">
                <p>Size: {formatFileSize(selectedFile.size)}</p>
                <p>Type: {selectedFile.type || 'Unknown'}</p>
              </div>
            )}
          </div>
          <div className="ml-2">
            {getStatusIcon()}
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && uploadProgress.total > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {uploadProgress.percentage}% - {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-2">
          <label
            className={`
              cursor-pointer px-4 py-2 rounded transition-colors
              ${uploading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {uploading ? 'Processing...' : 'Browse Files'}
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
          
          {selectedFile && (
            <button
              onClick={clearFile}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Clear file"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* File Format Info */}
        <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
          <Info size={12} className="mr-1" />
          Max {(parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '16777216') / 1024 / 1024).toFixed(0)}MB • 
          {(process.env.REACT_APP_SUPPORTED_FORMATS || 'pdf,docx,doc').toUpperCase()}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-medium mb-2">File Validation Errors:</h4>
          <ul className="text-red-600 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="flex items-center">
                <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Display */}
      {error && !validationErrors.length && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={16} />
            <p className="text-red-600 text-sm font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {uploadResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="text-green-500 mr-2" size={16} />
            <p className="text-green-600 text-sm font-medium">✓ Parsed successfully!</p>
          </div>
          <div className="text-green-700 text-xs space-y-1">
            <p>Words: {uploadResult.data?.word_count || 0}</p>
            <p>Characters: {uploadResult.data?.char_count || 0}</p>
            {uploadResult.data?.emails?.length > 0 && (
              <p>Email found: {uploadResult.data.emails.length}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;