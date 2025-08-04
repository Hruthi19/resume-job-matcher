import React from 'react';
import { Brain, Target, Lightbulb, FileText, Briefcase, Tag, Users, Building } from 'lucide-react';

interface ResultsDisplayProps {
  resumeData?: any;
  jobData?: any;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ resumeData, jobData }) => {
  if (!resumeData && !jobData) {
    return (
      <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Analysis Results</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Resume Analysis</h3>
            <p className="text-gray-600">Upload a resume to see analysis</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Job Analysis</h3>
            <p className="text-gray-600">Enter job description to see analysis</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Match Score</h3>
            <p className="text-gray-600">Coming in Day 3!</p>
          </div>
        </div>
      </div>
    );
  }

  const renderSkillTags = (skills: any) => {
    if (!skills) return null;
    
    const allSkills = Object.entries(skills).reduce((acc: string[], [category, categorySkills]) => {
      return acc.concat(categorySkills as string[]);
    }, []);

    if (allSkills.length === 0) return <p className="text-gray-500">No technical skills detected</p>;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {allSkills.slice(0, 10).map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center"
          >
            <Tag size={12} className="mr-1" />
            {skill}
          </span>
        ))}
        {allSkills.length > 10 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{allSkills.length - 10} more
          </span>
        )}
      </div>
    );
  };

  const renderTopWords = (topWords: [string, number][]) => {
    if (!topWords || topWords.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-2">Top Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {topWords.slice(0, 8).map(([word, count], index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {word} ({count})
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderEntities = (entities: any[]) => {
    if (!entities || entities.length === 0) return null;

    const entityIcons = {
      'ORG': Building,
      'PERSON': Users,
      'GPE': Target,
      'PRODUCT': Lightbulb
    };

    return (
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-2">Named Entities</h4>
        <div className="space-y-1">
          {entities.slice(0, 5).map((entity, index) => {
            const IconComponent = entityIcons[entity.label as keyof typeof entityIcons] || Tag;
            return (
              <div key={index} className="flex items-center text-sm">
                <IconComponent size={14} className="mr-2 text-gray-500" />
                <span className="font-medium">{entity.text}</span>
                <span className="ml-2 text-gray-500 text-xs">({entity.label})</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Analysis Results</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Resume Results */}
        {resumeData && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Resume Analysis
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>File:</strong> {resumeData.filename}</p>
                  <p><strong>Type:</strong> {resumeData.file_type?.toUpperCase()}</p>
                </div>
                <div>
                  <p><strong>Words:</strong> {resumeData.data?.word_count || 0}</p>
                  <p><strong>Characters:</strong> {resumeData.data?.char_count || 0}</p>
                </div>
              </div>
              
              {resumeData.data?.emails?.length > 0 && (
                <p><strong>Email:</strong> {resumeData.data.emails[0]}</p>
              )}
              
              {resumeData.data?.phones?.length > 0 && (
                <p><strong>Phone:</strong> {resumeData.data.phones[0]}</p>
              )}

              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Text Preview</h4>
                <p className="text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                  {resumeData.data?.raw_text?.substring(0, 200)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Job Results */}
        {jobData && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center">
              <Briefcase className="mr-2" size={20} />
              Job Analysis
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Words:</strong> {jobData.data?.word_count || 0}</p>
                  <p><strong>Sentences:</strong> {jobData.data?.sentence_count || 0}</p>
                </div>
                <div>
                  <p><strong>Skills Found:</strong> {
                    Object.values(jobData.data?.skills || {}).flat().length
                  }</p>
                  <p><strong>Entities:</strong> {jobData.data?.entities?.length || 0}</p>
                </div>
              </div>

              {/* Skills Section */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Technical Skills</h4>
                {renderSkillTags(jobData.data?.skills)}
              </div>

              {/* Top Words */}
              {renderTopWords(jobData.data?.top_words)}

              {/* Named Entities */}
              {renderEntities(jobData.data?.entities)}

              {/* Requirements Preview */}
              {jobData.data?.requirements?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Requirements Found</h4>
                  <p className="text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                    {jobData.data.requirements[0].substring(0, 150)}...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Match Score Placeholder */}
      {resumeData && jobData && (
        <div className="mt-8 bg-purple-50 p-6 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-4 flex items-center">
            <Brain className="mr-2" size={20} />
            Match Analysis
          </h3>
          <div className="text-center py-8">
            <Target size={48} className="mx-auto text-purple-400 mb-4" />
            <p className="text-purple-700 font-medium">Advanced matching coming in Day 3!</p>
            <p className="text-purple-600 text-sm mt-2">
              Resume and job description successfully parsed and ready for AI matching
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;