import React, { useState } from 'react';
import { Upload, FileText, Briefcase } from 'lucide-react';

interface FileUploadProps {
    title: string;
    accept: string;
    icon: 'resume' | 'job';
    onFileSelect: (file:File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({title, accept, icon, onFileSelect}) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dregover') {
            setDragActive(true);
        }
        else if(e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if( files && files[0]) {
            setSelectedFile(files[0]);
            onFileSelect(files[0]);
        }
    };

    const handleFileSelect = (e:React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if( files && files[0]) {
            setSelectedFile(files[0]);
            onFileSelect(files[0]);
        }
    };

    const IconComponent = icon === 'resume' ? FileText : Briefcase;

    return(
        <div className = "w-full max-w-md">
            <h3 className = "text-lg font-semibold mb-4 text-gray-700">
                {title}
            </h3>
            <div
                className = {`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter = {handleDrag}
                onDragLeave = {handleDrag}onDragOver = {handleDrag}
                onDrop = {handleDrop}>
                
                <IconComponent className = {`mx-auto mb-4 ${selectedFile ? 'text-green-500' : 'text-gray-400'}`} size = {48} />
                <p className = "mb-2 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'Drop your file here, or'}
                </p>
                <label className = "cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover: bg-blue-600 transition-colors">
                    Browse Files
                    <input
                        type = "file"
                        className = "hidden"
                        accept = {accept}
                        onChange = {handleFileSelect}
                        />
                </label>

            </div>

        </div>
    );
};

export default FileUpload;
