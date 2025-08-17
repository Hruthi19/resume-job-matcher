import os
import numpy as np
from typing import Dict, List, Tuple, Any
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

# import AI libraries
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("Sentence Transformers not available")

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("OpenAI not available")

class AIMatchEngine:
    def __init__(self):
        self.use_sentence_transformers = os.getenv('USE_SENTENCE_TRANSFORMERS', 'true').lower() == 'true'
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Initialize models
        self.sentence_model = None
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2),
            lowercase=True
        )

        if SENTENCE_TRANSFORMERS_AVAILABLE and self.use_sentence_transformers:
            try:
                print("Loading Sentence Transformer model...")
                self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
                print("Sentence Transformer model loaded successfully")
            except Exception as e:
                print(f"Failed to load Sentence Transformer: {e}")
                self.sentence_model = None

        if OPENAI_AVAILABLE and self.openai_api_key and not self.use_sentence_transformers:
            openai.api_key = self.openai_api_key
            print("OpenAI API configured")
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for matching"""
        if not text:
            return ""
        
        text = text.lower()
       
        text = ' '.join(text.split())
        
        text = re.sub(r'[^\w\s@.-]', ' ', text)
       
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def extract_key_sections(self, resume_text: str, job_text: str) -> Dict[str, str]:
        """Extract key sections from resume and job description"""
        
        experience_patterns = [
            r'experience:?(.*?)(?=education|skills|$)',
            r'work experience:?(.*?)(?=education|skills|$)',
            r'professional experience:?(.*?)(?=education|skills|$)'
        ]
        
        skills_patterns = [
            r'skills:?(.*?)(?=education|experience|$)',
            r'technical skills:?(.*?)(?=education|experience|$)',
            r'core competencies:?(.*?)(?=education|experience|$)'
        ]
        
        education_patterns = [
            r'education:?(.*?)(?=experience|skills|$)',
            r'academic background:?(.*?)(?=experience|skills|$)',
            r'course work:?(.*?)(?=experience|skills|$)'
        ]

        def extract_section(text: str, patterns: List[str]) -> str:
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    return match.group(1).strip()
            return ""
        
        resume_sections = {
            'experience': extract_section(resume_text, experience_patterns),
            'skills': extract_section(resume_text, skills_patterns),
            'education': extract_section(resume_text, education_patterns),
            'full_text': resume_text
        }
        
        job_sections = {
            'requirements': extract_section(job_text, [
                r'requirements?:?(.*?)(?=responsibilities|$)',
                r'qualifications?:?(.*?)(?=responsibilities|$)',
                r'what we\'re looking for:?(.*?)(?=what we offer|$)'
            ]),
            'responsibilities': extract_section(job_text, [
                r'responsibilities:?(.*?)(?=requirements|$)',
                r'duties:?(.*?)(?=requirements|$)',
                r'you will:?(.*?)(?=requirements|$)'
            ]),
            'full_text': job_text
        }
        
        return {'resume': resume_sections, 'job': job_sections}
    
    def get_embeddings_sentence_transformer(self, texts: List[str]) -> np.ndarray:
        """Get embeddings using Sentence Transformers"""
        if not self.sentence_model:
            raise ValueError("Sentence Transformer model not available")
        
        embeddings = self.sentence_model.encode(texts, convert_to_tensor=False)
        return np.array(embeddings)
    
    def get_embeddings_openai(self, texts: List[str]) -> np.ndarray:
        """Get embeddings using OpenAI API"""
        if not OPENAI_AVAILABLE or not self.openai_api_key:
            raise ValueError("OpenAI not available or API key not set")
        
        embeddings = []
        for text in texts:
            try:
                response = openai.Embedding.create(
                    input=text[:8000], 
                    model="text-embedding-ada-002"
                )
                embeddings.append(response['data'][0]['embedding'])
            except Exception as e:
                print(f"OpenAI API error: {e}")
                embeddings.append([0.0] * 1536)  
        
        return np.array(embeddings)
    
    def get_tfidf_similarity(self, resume_text: str, job_text: str) -> float:
        """Calculate TF-IDF cosine similarity"""
        try:
            documents = [
                self.preprocess_text(resume_text),
                self.preprocess_text(job_text)
            ]
            
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(documents)
            similarity_matrix = cosine_similarity(tfidf_matrix)
            
            return float(similarity_matrix[0][1])
        except Exception as e:
            print(f"TF-IDF similarity error: {e}")
            return 0.0

    def get_embedding_similarity(self, resume_text: str, job_text: str) -> float:
        """calculate embedding-based cosine similarity"""
        try:
            texts = [
                self.preprocess_text(resume_text),
                self.preprocess_text(job_text)
            ]

            if self.sentence_model:
                embeddings = self.get_embeddings_sentence_transformer(texts)
            elif OPENAI_AVAILABLE and self.openai_api_key:
                embeddings = self.get_embeddings_openai(texts)
            else:
                return 0.0
            
            similarity = cosine_similarity([embeddings[0]],[embeddings[1]]) [0][0]
            return float(similarity)
        
        except Exception as e:
            print(f"Embedding similarity error: {e}")
            return 0.0

    def extract_skills_match(self, resume_skills: Dict, job_skills: Dict) -> Dict[str, Any]:
        """Analyze skill matching between resume and job"""
        
        resume_skill_list = []
        job_skill_list = []
        
        for category, skills in resume_skills.items():
            resume_skill_list.extend([skill.lower() for skill in skills])
        
        for category, skills in job_skills.items():
            job_skill_list.extend([skill.lower() for skill in skills])
        
        
        matched_skills = list(set(resume_skill_list) & set(job_skill_list))
        missing_skills = list(set(job_skill_list) - set(resume_skill_list))
        extra_skills = list(set(resume_skill_list) - set(job_skill_list))
        
        
        total_job_skills = len(job_skill_list) if job_skill_list else 1
        skill_match_percentage = (len(matched_skills) / total_job_skills) * 100
        
        return {
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'extra_skills': extra_skills,
            'skill_match_percentage': skill_match_percentage,
            'total_job_skills': len(job_skill_list),
            'total_resume_skills': len(resume_skill_list)
        }
    
    def analyze_keyword_density(self, resume_text: str, job_text: str) -> Dict[str, Any]:
        """Analyze keyword density and important terms"""
       
        job_clean = self.preprocess_text(job_text)
        resume_clean = self.preprocess_text(resume_text)
        
        try:
            
            job_tfidf = self.tfidf_vectorizer.fit_transform([job_clean])
            feature_names = self.tfidf_vectorizer.get_feature_names_out()
            
            job_scores = job_tfidf.toarray()[0]
            top_indices = job_scores.argsort()[-20:][::-1] 
            
            job_keywords = [(feature_names[i], job_scores[i]) for i in top_indices if job_scores[i] > 0]
            
            keyword_matches = []
            for keyword, score in job_keywords:
                if keyword in resume_clean:
                    keyword_matches.append({
                        'keyword': keyword,
                        'job_importance': score,
                        'in_resume': True
                    })
                else:
                    keyword_matches.append({
                        'keyword': keyword,
                        'job_importance': score,
                        'in_resume': False
                    })
           
            matched_keywords = [k for k in keyword_matches if k['in_resume']]
            keyword_coverage = (len(matched_keywords) / len(job_keywords)) * 100 if job_keywords else 0
            
            return {
                'job_keywords': job_keywords[:10],  
                'keyword_matches': keyword_matches[:10],
                'keyword_coverage_percentage': keyword_coverage,
                'total_important_keywords': len(job_keywords)
            }
            
        except Exception as e:
            print(f"Keyword analysis error: {e}")
            return {
                'job_keywords': [],
                'keyword_matches': [],
                'keyword_coverage_percentage': 0,
                'total_important_keywords': 0
            }
    
    def generate_match_insights(self, match_result: Dict[str, Any]) -> List[str]:
        """Generate human-readable insights about the match"""
        insights = []
        
        overall_score = match_result.get('overall_score', 0)
        skill_analysis = match_result.get('skill_analysis', {})
        keyword_analysis = match_result.get('keyword_analysis', {})
        
        if overall_score >= 80:
            insights.append("🟢 Excellent match! This candidate shows strong alignment with the job requirements.")
        elif overall_score >= 60:
            insights.append("🟡 Good match. The candidate meets most of the key requirements.")
        elif overall_score >= 40:
            insights.append("🟠 Moderate match. Some relevant experience but may need development in key areas.")
        else:
            insights.append("🔴 Limited match. Significant gaps in required skills and experience.")
        
        skill_match_pct = skill_analysis.get('skill_match_percentage', 0)
        matched_skills = skill_analysis.get('matched_skills', [])
        missing_skills = skill_analysis.get('missing_skills', [])
        
        if skill_match_pct >= 70:
            insights.append(f"✅ Strong technical fit with {len(matched_skills)} relevant skills matched.")
        elif skill_match_pct >= 40:
            insights.append(f"⚠️ Partial technical fit. Has {len(matched_skills)} required skills but missing {len(missing_skills)} key skills.")
        else:
            insights.append(f"❌ Limited technical match. Missing {len(missing_skills)} critical skills.")
        
        keyword_coverage = keyword_analysis.get('keyword_coverage_percentage', 0)
        if keyword_coverage >= 70:
            insights.append("📝 Resume language closely matches job requirements.")
        elif keyword_coverage >= 40:
            insights.append("📝 Some alignment in resume language, but could be improved.")
        else:
            insights.append("📝 Resume language needs optimization for this role.")
       
        if missing_skills:
            top_missing = missing_skills[:3]
            insights.append(f"🎯 Focus areas for improvement: {', '.join(top_missing)}")
        
        return insights
    
    def calculate_comprehensive_match(self, resume_data: Dict, job_data: Dict) -> Dict[str, Any]:
        """Calculate comprehensive match score with detailed analysis"""
        
        try:
            
            resume_text = resume_data.get('data', {}).get('raw_text', '')
            job_text = job_data.get('data', {}).get('original_text', '')
            
            if not resume_text or not job_text:
                return {
                    'success': False,
                    'error': 'Missing resume or job description text'
                }
           
            tfidf_score = self.get_tfidf_similarity(resume_text, job_text)
            embedding_score = self.get_embedding_similarity(resume_text, job_text)
            
            resume_skills = job_data.get('data', {}).get('skills', {}) 
            job_skills = job_data.get('data', {}).get('skills', {})
            skill_analysis = self.extract_skills_match(resume_skills, job_skills)
            
           
            keyword_analysis = self.analyze_keyword_density(resume_text, job_text)
           
            scores = {
                'tfidf_similarity': tfidf_score * 100,  
                'embedding_similarity': embedding_score * 100,
                'skill_match': skill_analysis.get('skill_match_percentage', 0),
                'keyword_coverage': keyword_analysis.get('keyword_coverage_percentage', 0)
            }
            
            weights = {
                'tfidf_similarity': 0.25,
                'embedding_similarity': 0.35,
                'skill_match': 0.25,
                'keyword_coverage': 0.15
            }
            
            overall_score = sum(scores[key] * weights[key] for key in scores.keys())
           
            match_result = {
                'overall_score': round(overall_score, 2),
                'scores': scores,
                'skill_analysis': skill_analysis,
                'keyword_analysis': keyword_analysis
            }
            
            insights = self.generate_match_insights(match_result)
            
            return {
                'success': True,
                'data': {
                    'overall_score': round(overall_score, 2),
                    'confidence_level': 'High' if overall_score >= 60 else 'Medium' if overall_score >= 40 else 'Low',
                    'scores': {
                        'tfidf_similarity': round(scores['tfidf_similarity'], 2),
                        'ai_similarity': round(scores['embedding_similarity'], 2),
                        'skill_match': round(scores['skill_match'], 2),
                        'keyword_coverage': round(scores['keyword_coverage'], 2)
                    },
                    'skill_analysis': skill_analysis,
                    'keyword_analysis': keyword_analysis,
                    'insights': insights,
                    'recommendation': self._get_recommendation(overall_score)
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Match calculation failed: {str(e)}'
            }
    
    def _get_recommendation(self, score: float) -> str:
        """Get hiring recommendation based on score"""
        if score >= 80:
            return "Strong Recommend"
        elif score >= 60:
            return "Recommend"
        elif score >= 40:
            return "Consider"
        else:
            return "Not Recommended"
    