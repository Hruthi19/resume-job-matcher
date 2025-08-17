import React, { useState } from 'react';
import { Brain, Loader, Zap, Target, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface MatchScoreProps {
    resumeData?: any;
    jobData?: any;
    onMatchComplete?: (result: any) => void;
}

const MatchScore: React.FC<MatchScoreProps> = ({ resumeData, jobData, onMatchComplete }) => {
    const [calculating, setCalculating] = useState(false);
    const [matchResult, setMatchResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const calculateMatch = async () => {
    setCalculating(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/match-score`);
      
      setMatchResult(response.data);
      if (onMatchComplete) {
        onMatchComplete(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Match calculation failed';
      setError(errorMessage);
    } finally {
      setCalculating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const canCalculateMatch = resumeData && jobData;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center justify-center">
          <Brain className="mr-2 text-purple-600" size={28} />
          AI Match Analysis
        </h2>
        <p className="text-gray-600">
          Advanced AI-powered matching using embeddings and cosine similarity
        </p>
      </div>

      {!canCalculateMatch && (
        <div className="text-center py-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <Brain className="mx-auto mb-4 text-blue-400" size={48} />
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Ready for AI Analysis
            </h3>
            <p className="text-blue-600">
              Upload a resume and enter a job description to calculate the AI match score
            </p>
            <div className="flex justify-center mt-4 space-x-4 text-sm">
              <div className={`flex items-center ${resumeData ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${resumeData ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Resume {resumeData ? 'Ready' : 'Needed'}
              </div>
              <div className={`flex items-center ${jobData ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${jobData ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Job Description {jobData ? 'Ready' : 'Needed'}
              </div>
            </div>
          </div>
        </div>
      )}

      {canCalculateMatch && !matchResult && (
        <div className="text-center mb-6">
          {!calculating ? (
            <button
              onClick={calculateMatch}
              className="px-8 py-3 rounded-lg text-white font-medium transition-all duration-200 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105"
            >
              <div className="flex items-center">
                <Zap className="mr-2" size={20} />
                Calculate AI Match Score
              </div>
            </button>
          ) : (
            <div className="text-center mb-6 text-gray-600 flex justify-center items-center">
              <Loader className="animate-spin mr-2 text-purple-600" size={20} />
              Calculating AI Match...
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {matchResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className={`${getScoreBgColor(matchResult.data.overall_score)} rounded-lg p-6 text-center`}>
            <div className={`text-4xl font-bold ${getScoreColor(matchResult.data.overall_score)} mb-2`}>
              {matchResult.data.overall_score}%
            </div>
            <div className="text-lg font-medium text-gray-700 mb-2">
              Overall Match Score
            </div>
            <div className="text-sm text-gray-600">
              Confidence: {matchResult.data.confidence_level}
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
              matchResult.data.recommendation === 'Strong Recommend' ? 'bg-green-200 text-green-800' :
              matchResult.data.recommendation === 'Recommend' ? 'bg-blue-200 text-blue-800' :
              matchResult.data.recommendation === 'Consider' ? 'bg-yellow-200 text-yellow-800' :
              'bg-red-200 text-red-800'
            }`}>
              {matchResult.data.recommendation}
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Target className="mx-auto mb-2 text-blue-600" size={24} />
              <div className="text-2xl font-bold text-blue-600">
                {matchResult.data.scores.ai_similarity}%
              </div>
              <div className="text-sm text-gray-600">AI Similarity</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
              <div className="text-2xl font-bold text-green-600">
                {matchResult.data.scores.skill_match}%
              </div>
              <div className="text-sm text-gray-600">Skill Match</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Brain className="mx-auto mb-2 text-purple-600" size={24} />
              <div className="text-2xl font-bold text-purple-600">
                {matchResult.data.scores.tfidf_similarity}%
              </div>
              <div className="text-sm text-gray-600">TF-IDF Match</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Zap className="mx-auto mb-2 text-orange-600" size={24} />
              <div className="text-2xl font-bold text-orange-600">
                {matchResult.data.scores.keyword_coverage}%
              </div>
              <div className="text-sm text-gray-600">Keyword Coverage</div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">AI Insights</h3>
            <div className="space-y-2">
              {matchResult.data.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start">
                  <div className="text-gray-600 text-sm leading-relaxed">
                    {insight}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Analysis */}
          {matchResult.data.skill_analysis && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Matched Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {matchResult.data.skill_analysis.matched_skills?.slice(0, 10).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {matchResult.data.skill_analysis.missing_skills?.slice(0, 10).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchScore;

