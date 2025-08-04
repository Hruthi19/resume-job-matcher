from flask import Flask
from flask_cors import CORS
from app.config import config
from dotenv import load_dotenv
import os
import logging
from logging.handlers import RotatingFileHandler

load_dotenv()

def create_app(config_name = None):
    app = Flask(__name__)
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV')
    app.config.from_object(config[config_name])
    
    # Initialize CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Create upload directory
    upload_dir = app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Create logs directory
    log_dir = os.path.dirname(app.config['LOG_FILE'])
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Configure logging
    if not app.debug and not app.testing:
        if app.config['LOG_FILE']:
            file_handler = RotatingFileHandler(
                app.config['LOG_FILE'], 
                maxBytes=10240000, 
                backupCount=10
            )
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(getattr(logging, app.config['LOG_LEVEL']))
            app.logger.addHandler(file_handler)
        
        app.logger.setLevel(getattr(logging, app.config['LOG_LEVEL']))
        app.logger.info('Resume Job Matcher startup')
    
    # Register blueprints
    from app.routes.main import bp as main_bp
    app.register_blueprint(main_bp, url_prefix=app.config['API_PREFIX'])
    
    return app