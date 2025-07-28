import React, { useState } from 'react';
import { Upload, FileText, Briefcase, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface FileUploadProps {
  title: string;
  accept: string;
  icon: 'resume' | 'job';
  onFileSelect: (file: File) => void;
  onUploadComplete?: (result: any) => void;
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
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setSelectedFile(file);
    setError('');
    setUploadResult(null);
    onFileSelect(file);

    if (icon === 'resume') {
      await uploadResume(file);
    }
  };

  const uploadResume = async (file: File) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post('http://localhost:5000/api/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Upload failed';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const IconComponent = icon === 'resume' ? FileText : Briefcase;

  const getStatusIcon = () => {
    if (uploading) return <Loader className="animate-spin text-blue-500" size={20} />;
    if (error) return <AlertCircle className="text-red-500" size={20} />;
    if (uploadResult) return <CheckCircle className="text-green-500" size={20} />;
    return null;
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : error
            ? 'border-red-500 bg-red-50'
            : uploadResult 
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <IconComponent 
          className={`mx-auto mb-4 ${
            error ? 'text-red-500' : 
            uploadResult ? 'text-green-500' : 
            'text-gray-400'
          }`} 
          size={48} 
        />
        
        <div className="flex items-center justify-center mb-2">
          <p className="text-sm text-gray-500 mr-2">
            {selectedFile ? selectedFile.name : 'Drop your file here, or'}
          </p>
          {getStatusIcon()}
        </div>
        
        <label className={`cursor-pointer px-4 py-2 rounded transition-colors ${
          uploading 
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}>
          {uploading ? 'Processing...' : 'Browse Files'}
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>

        {error && (
          <div className="mt-4 text-red-600 text-sm">
            <p>Error: {error}</p>
          </div>
        )}

        {uploadResult && (
          <div className="mt-4 text-green-600 text-sm">
            <p>✓ Parsed successfully!</p>
            <p>Words: {uploadResult.data?.word_count || 0}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;