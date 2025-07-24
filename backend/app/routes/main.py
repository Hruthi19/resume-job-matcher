from flask import Blueprint, request, jsonify
import os

bp = Blueprint('main', __name__)

@bp.route('/api/health', methods = ['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message' : 'Resume Job Matcher API ia running'})

@bp.route('/api/upload-resume', methods = ['POST'])
def upload_resume():
    # Resume upload logic
    return jsonify({'message': 'Resume upload endpoint - coming soon'})

@bp.route('/api/analyze-job', methods = ['POST'])
def analyze_job():
    # job analysis logic
    return jsonify({'message': 'Job analysis endpoint - coming soon'})

@bp.route('/api/match-score', methods = ['POST'])
def get_match_score():
    # matching logic
    return jsonify({'message': 'Match socre endpoint - coming soon'})

