import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import JobTextInput from '../components/JobTextInput';
import { Brain, Target, Lightbulb } from 'lucide-react';

const HomePage: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState<string | null> (null);

  const handleAnalyze = () => {
    const errors: string[] = [];
    if (!resumeFile) {
      errors.push('Please upload a resume');
    }
    if (!jobDescription.trim()) {
      errors.push('Please enter a job description');
    }
    if(errors.length > 0){
        const errorMsg = `${errors.join(' and ')}`;
        console.log("setting error: ",errorMsg)
        setError(errorMsg);
        return;
    }
    //analysis logic
    setError(null);
    console.log('Analyzing...', { resumeFile, jobDescription });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Resume Job Matcher
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get AI-powered insights on how well your resume matches job requirements
          </p>
          <div className="flex justify-center space-x-8 mb-8">
            <div className="flex items-center text-blue-600">
              <Target className="mr-2" size={20} />
              <span>Match Score</span>
            </div>
            <div className="flex items-center text-green-600">
              <Lightbulb className="mr-2" size={20} />
              <span>Keyword Suggestions</span>
            </div>
            <div className="flex items-center text-purple-600">
              <Brain className="mr-2" size={20} />
              <span>AI Analysis</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8 mb-12">
          <FileUpload
            title="Upload Resume"
            accept=".pdf,.docx,.doc"
            icon="resume"
            onFileSelect={(file) => setResumeFile(file)}
          />
          <JobTextInput onTextChange={setJobDescription} />
        </div>

        {/* Analyze Button */}
        <div className="text-center">
          <button
            onClick={handleAnalyze}
            className="px-8 py-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all" 
          >
            Analyze Match
          </button>
        {/*Error Message*/}
        {error && (
            <div className = "text-red-600 text-sm text-center mb-4">
                {error}
            </div> 
        )}
        </div>

        {/* Results Preview (placeholder) */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Analysis Results</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Match Score</h3>
              <p className="text-gray-600">Upload files to see your match score</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Missing Keywords</h3>
              <p className="text-gray-600">Suggested keywords will appear here</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Recommendations</h3>
              <p className="text-gray-600">AI-powered suggestions will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;