from flask import Blueprint, request, jsonify
import os
from app.utils.resume_parser import ResumeParser
from app.utils.job_processor import JobDescriptionProcessor
from app.utils.match_engine import AIMatchEngine

bp = Blueprint('main', __name__)

resume_parser = ResumeParser()
job_processor = JobDescriptionProcessor()
match_engine = AIMatchEngine()

stored_resume_data = None
stored_job_data = None

@bp.route('/health', methods = ['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'message' : 'Resume Job Matcher API ia running',
        'ai_status': {
            'sentence_transformers': hasattr(match_engine, 'sentence_model') and match_engine.sentence_model is not None,
            'openai': bool(match_engine.openai_api_key)
        }
    })

@bp.route('/upload-resume', methods = ['POST'])
def upload_resume():
    # Resume upload logic

    global stored_resume_data

    try:
        #Check if file is present
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}),400
        
        file = request.files['resume']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}),400
        
        result = resume_parser.parse_resume(file)

        if result['success']:
            stored_resume_data = result

            return jsonify({
                'message': 'Resume uploaded and parsed successfully',
                'data': result['data']
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bp.route('/analyze-job', methods = ['POST'])
def analyze_job():
    # job analysis logic

    global stored_job_data

    try:
        data = request.get_json()

        if not data or 'job_description' not in data:
            return jsonify({'error': 'No job description provided'}), 400
        
        job_description = data['job_description']
        if len(job_description.strip()) < 50:
            return jsonify({'error': 'Job description too short (minimum 50 characters)'}), 400

        result = job_processor.process_job_description(job_description)  

        if result['success']:
            stored_job_data = result
            return jsonify({
                'message': 'Job description analyzed successfully',
                'data': result['data']
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bp.route('/match-score', methods = ['POST'])
def get_match_score():
    # matching logic
    global stored_resume_data, stored_job_data

    try:
        
        if not stored_resume_data:
            return jsonify({
                'error': 'No resume data available to calculate match score. Please upload a resume.'
            }), 400
        if not stored_job_data:
            return jsonify({
                'error': 'No job data available to calculate match score. Please analyze the job description.'
            }), 400
        
        match_result = match_engine.calculate_comprehensive_match(stored_resume_data,stored_job_data)

        if match_result['success']:
            return jsonify({
                'message': 'Match score calculated successfully',
                'data': match_result['data']
            }), 200
        else:
            return jsonify({'error': match_result['error']}), 400
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bp.route('/match-score-custom', methods = ['POST'])
def get_match_score_custom():
    """Calculate match score with custom resume and job data"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        resume_text = data.get('resume_text')
        job_text = data.get('jb_text')

        if not resume_text or not job_text:
            return jsonify({
                'error': 'Both resume and job text are required to calculate match score.'
            }), 400
        
        temp_resume_data = {
            'data': {'raw_text': resume_text}
        }
        temp_job_data = {
            'data': {'original_text': job_text, 'skills': {}}
        }

        match_result = match_engine.calculate_comprehensive_match(
            temp_resume_data,
            temp_job_data
        )

        if match_result['success']:
            return jsonify({
                'message': 'Match score calculated successfully',
                'data': match_result['data']
            }), 200
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bp.route('/test-ai', methods = ['GET'])
def test_ai():
    """Test endpoints to verify AI matching"""
    try:
        test_resume = """

        John Doe
        Software Engineer
        
        Experience:
        - 3 years Python development
        - Django and Flask experience
        - React.js frontend development
        - AWS cloud services
        - Machine learning with scikit-learn
        
        Skills: Python, JavaScript, React, Django, AWS, SQL, Git
"""
        test_job = """
        We are looking for a Python developer with experience in:
        - Django framework
        - React for frontend
        - AWS cloud platforms
        - RESTful API development
        - Agile development practices
        
        Requirements:
        - 2+ years Python experience
        - Strong problem-solving skills
        - Experience with cloud platforms
"""
        resume_data = {'data': {'raw_text': test_resume}}
        job_data = {'data': {'original_text': test_job, 'skills': {
            'frameworks':['django', 'react'],
            'cloud_platforms': ['aws'],
            'programming_languages': ['python']
        }}}
        
        result = match_engine.calculate_comprehensive_match(resume_data, job_data)

        return jsonify({
            'message': 'AI matching test completed',
            'test_result': result,
            'ai_status': {
                'sentence_transformers_available': hasattr(match_engine, 'sentence_model') and match_engine.sentence_model is not None,
                'openai_configured': bool(match_engine.openai_api_key)
            }
        })
    
    except Exception as e:
        return jsonify({
            'error': f'AI test failed: {str(e)}',
            'message': 'Error during AI matching test',
        }), 500

@bp.route('/stored-data', methods=['GET'])
def get_stored_data():
    """Get currently stored resume and job data"""
    return jsonify({
        'has_resume': stored_resume_data is not None,
        'has_job': stored_job_data is not None,
        'resume_filename': stored_resume_data.get('filename') if stored_resume_data else None,
        'job_word_count': stored_job_data.get('data', {}).get('word_count') if stored_job_data else None
    })

@bp.route('/clear-data', methods=['POST'])
def clear_stored_data():
    """Clear stored resume and job data"""
    global stored_resume_data, stored_job_data
    stored_resume_data = None
    stored_job_data = None
    return jsonify({'message': 'Stored data cleared successfully'})

@bp.route('/test-nlp', methods = ['GET'])
def test_nlp():
    # test nlp endpoint
    try:
        test_job = "We are looking for a Python developer with experience in Django and React."
        result = job_processor.process_job_description(test_job)

        return jsonify({
            'message': 'NLP libraries working correctly',
            'test_result': result
        })
    
    except Exception as e:
        return jsonify({
            'message': f'NLP setup issue: {str(e)}',
            'message': 'Please check if all dependencies are installed'
        }), 500

