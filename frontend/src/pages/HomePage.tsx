import React, { useState } from 'react';
import { Brain, Github, Star } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import JobTextInput from '../components/JobTextInput';
import ResultsDisplay from '../components/ResultsDisplay';

function App() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [jobText, setJobText] = useState<string>('');

  const handleResumeUpload = (result: any) => {
    setResumeData(result);
  };

  const handleJobAnalysis = (result: any) => {
    setJobData(result);
  };

  const handleResumeFileSelect = (file: File) => {
    setSelectedResumeFile(file);
  };

  const handleJobTextChange = (text: string) => {
    setJobText(text);
    // Clear previous analysis when text changes significantly
    if (jobData && text.length < 50) {
      setJobData(null);
    }
  };

  const resetApplication = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Brain className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Resume Job Matcher
                  </h1>
                  <p className="text-sm text-gray-500">
                    AI-Powered Resume Analysis Tool
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              
              <button
                onClick={resetApplication}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reset
              </button>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              resumeData ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                resumeData ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">Resume Upload</span>
            </div>
            
            <div className="w-8 h-px bg-gray-300" />
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              jobData ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                jobData ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">Job Analysis</span>
            </div>
            
            <div className="w-8 h-px bg-gray-300" />
            
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm font-medium">AI Matching (Day 3)</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <FileUpload
              title="Upload Resume"
              accept=".pdf,.docx,.doc"
              icon="resume"
              onFileSelect={handleResumeFileSelect}
              onUploadComplete={handleResumeUpload}
            />
            
            {/* Upload Status */}
            {selectedResumeFile && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800 font-medium">Selected File:</span>
                  <span className="text-blue-600">{selectedResumeFile.name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <JobTextInput
              onTextChange={handleJobTextChange}
              onAnalysisComplete={handleJobAnalysis}
              isResumeUploaded={!!selectedResumeFile}
            />
            
            {/* Text Status */}
            {jobText.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-800 font-medium">Text Length:</span>
                  <span className="text-green-600">
                    {jobText.length} characters
                    {jobText.length < 50 && (
                      <span className="text-orange-600 ml-2">
                        (Minimum 50 required)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {(resumeData || jobData) && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">Quick Actions:</span>
                {resumeData && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Resume: {resumeData.data?.word_count || 0} words
                  </span>
                )}
                {jobData && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    Job: {Object.values(jobData.data?.skills || {}).flat().length} skills found
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {resumeData && jobData && (
                  <button className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium cursor-not-allowed">
                    Generate Match Score (Day 3)
                  </button>
                )}
                <button
                  onClick={resetApplication}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        <ResultsDisplay resumeData={resumeData} jobData={jobData} />

        {/* Feature Preview */}
        {resumeData && jobData && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <div className="text-center">
              <Brain className="mx-auto text-purple-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-purple-900 mb-2">
                Coming Tomorrow: AI-Powered Matching! 🚀
              </h3>
              <p className="text-purple-700 mb-4">
                Your resume and job description are ready for advanced AI analysis.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                  <div className="font-medium text-purple-800">Skill Matching</div>
                  <div className="text-purple-600">AI-powered skill comparison</div>
                </div>
                <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                  <div className="font-medium text-purple-800">Experience Analysis</div>
                  <div className="text-purple-600">Context-aware matching</div>
                </div>
                <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                  <div className="font-medium text-purple-800">Match Score</div>
                  <div className="text-purple-600">Percentage compatibility</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Information (Development only) */}
        {process.env.REACT_APP_ENV === 'development' && (resumeData || jobData) && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info (Development Mode)</h4>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              {resumeData && (
                <div>
                  <div className="font-medium text-gray-600 mb-1">Resume Data:</div>
                  <pre className="bg-white p-2 rounded border overflow-x-auto text-gray-800">
                    {JSON.stringify({
                      filename: resumeData.filename,
                      file_type: resumeData.file_type,
                      word_count: resumeData.data?.word_count,
                      char_count: resumeData.data?.char_count,
                      emails: resumeData.data?.emails?.length || 0,
                      phones: resumeData.data?.phones?.length || 0
                    }, null, 2)}
                  </pre>
                </div>
              )}
              {jobData && (
                <div>
                  <div className="font-medium text-gray-600 mb-1">Job Data:</div>
                  <pre className="bg-white p-2 rounded border overflow-x-auto text-gray-800">
                    {JSON.stringify({
                      word_count: jobData.data?.word_count,
                      sentence_count: jobData.data?.sentence_count,
                      skills_found: Object.values(jobData.data?.skills || {}).flat().length,
                      entities: jobData.data?.entities?.length || 0,
                      top_words: jobData.data?.top_words?.slice(0, 5)
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Brain className="text-blue-500" size={20} />
                <span className="text-gray-600">Resume Job Matcher</span>
              </div>
              <span className="text-gray-400">|</span>
              
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Backend API: Running</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>File Processing: Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>AI Matching: Coming Soon</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-400">
              <p>Built with React, Flask, NLTK, and spaCy </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;