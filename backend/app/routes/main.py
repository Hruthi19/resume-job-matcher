from flask import Blueprint, request, jsonify
import os
from app.utils.resume_parser import ResumeParser
from app.utils.job_processor import JobDescriptionProcessor

bp = Blueprint('main', __name__)

resume_parser = ResumeParser()
job_processor = JobDescriptionProcessor()

@bp.route('/test', methods=['POST'])
def test_endpoint():
    data = request.json
    return jsonify({'received': data})

@bp.route('/health', methods = ['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message' : 'Resume Job Matcher API ia running'})

@bp.route('/upload-resume', methods = ['POST'])
def upload_resume():
    # Resume upload logic
    try:
        #Check if file is present
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}),400
        
        file = request.files['resume']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}),400
        
        result = resume_parser.parse_resume(file)

        if result['success']:
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
    try:
        data = request.get_json()

        if not data or 'job_description' not in data:
            return jsonify({'error': 'No job description provided'}), 400
        
        job_description = data['job_description']

        result = job_processor.process_job_description(job_description)

        if result['success']:
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
    return jsonify({'message': 'Match socre endpoint - coming soon'})

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

