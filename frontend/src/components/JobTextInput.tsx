import React, { useState } from 'react';
import { FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';


interface JobTextInputProps {
  onTextChange: (text: string) => void;
  onAnalysisComplete?: (result: any) => void;
  isResumeUploaded: boolean;
}

const JobTextInput: React.FC<JobTextInputProps> = ({ onTextChange, onAnalysisComplete, isResumeUploaded }) => {
  const [jobText, setJobText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJobText(text);
    onTextChange(text);

    if (analysisResult) {
      setAnalysisResult(null);
      setError('');
    }
  };

  const analyzeJobDescription = async () => {

    setAnalyzing(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/analyze-job', {
        job_description: jobText
      });

      setAnalysisResult(response.data);
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Analysis failed';
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusIcon = () => {
    if (analyzing) return <Loader className="animate-spin text-blue-500" size={20} />;
    if (error) return <AlertCircle className="text-red-500" size={20} />;
    if (analysisResult) return <CheckCircle className="text-green-500" size={20} />;
    return null;
  };

  const isAnalyzeDisabled = !isResumeUploaded || jobText.length < 50;

  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <FileText className="mr-2" size={20} />
        Job Description
      </h3>

      <textarea
        className={`w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${
           error ? 'border-red-500' : 
          analysisResult ? 'border-green-500' : 
          'border-gray-300 focus:border-blue-500' 
        }`}
        placeholder="Paste the job description here..."
        value={jobText}
        onChange={handleTextChange}
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-gray-500">
          Characters: {jobText.length}
        </p>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <button
            onClick={analyzeJobDescription}
            disabled={analyzing || isAnalyzeDisabled}
            className={`px-4 py-2 rounded text-sm transition-colors ${
                analyzing || isAnalyzeDisabled
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Job'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      {analysisResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm font-medium">✓ Analysis Complete!</p>
          <div className="mt-2 text-sm">
            <p>Words: {analysisResult.data?.word_count || 0}</p>
            <p>Sentences: {analysisResult.data?.sentence_count || 0}</p>
            <p>Skills found: {Object.values(analysisResult.data?.skills || {}).flat().length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTextInput;