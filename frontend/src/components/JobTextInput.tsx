import React, { useState } from 'react';
import { FileText } from 'lucide-react';

interface JobTextInputProps {
  onTextChange: (text: string) => void;
}

const JobTextInput: React.FC<JobTextInputProps> = ({ onTextChange }) => {
  const [jobText, setJobText] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJobText(text);
    onTextChange(text);
  };

  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <FileText className="mr-2" size={20} />
        Job Description
      </h3>
      <textarea
        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder="Paste the job description here..."
        value={jobText}
        onChange={handleTextChange}
      />
      <p className="text-sm text-gray-500 mt-2">
        Characters: {jobText.length}
      </p>
    </div>
  );
};

export default JobTextInput;