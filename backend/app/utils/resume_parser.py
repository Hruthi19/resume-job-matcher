import os
import re
from pdfminer.high_level import extract_text
from docx import Document
from werkzeug.utils import secure_filename
import tempfile

class ResumeParser:
    def __init__(self):
        self.allowed_extensions = {'pdf', 'docx', 'doc'}
    
    def is_allowed_file(self, filename):
        return '.' in filename.rsplit('.',1)[1].lower() in self.allowed_extensions

    def extract_text_from_pdf(self, file_path):
        try:
            text = extract_text(file_path)
            return text
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")
    
    def extract_text_from_docx(self, file_path):
        try:
            doc = Document(file_path)
            text = []
            for paragraph in doc.paragraphs:
                text.append(paragraph.text)
            return '\n'.join(text)
        except Exception as e:
            raise Exception(f"Error extracting DOCX text: {str(e)}")
    
    def clean_text(self, text):
        if not text:
            return ""
        text = ''.join(text.split())
        text = re.sub(r'[^\w\s@.-]', ' ', text)
        text = re.sub(r'\s+', ' ',text).strip()

        return text
    
    def extract_basic_info(self, text):
        info = {
            'raw_text': text,
            'word_count': len(text.split()),
            'char_count': len(text)
        }

        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text, re.IGNORECASE)
        info['emails'] = emails

        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, text)
        info['phones'] = [phone[0] + phone[1] if len(phone) > 1 else phone for phone in phones]
    
    def parse_resume(self, file):
        """Main method"""
        try:
            filename = secure_filename(file.filename)

            if not self.is_allowed_file(filename):
                raise ValueError("File type not allowed. Please upload a PDF or DOCX file.")
            
            #Temporary file
            with tempfile.NamedTemporaryFile(delete = False, suffix = os.path.splittext(filename)[1]) as temp_file:
                file.save(temp_file.name)
                temp_file_path = temp_file.name
            
            try:
                file_extension = filename.rsplit('.', 1)[1].lower()

                if file_extension =='pdf':
                    raw_text = self.extract_text_from_pdf(temp_file_path)
                elif file_extension in ['docx', 'doc']:
                    raw_text = self.extract_text_from_docx(temp_file_path)
                else:
                    raise ValueError("Unsupported file type") 

                cleaned_text = self.clean_text(raw_text)

                resume_info = self.extract_basic_info(cleaned_text)

                return {
                    'success': True,
                    'filename': filename,
                    'file_type': file_extension,
                    'data': resume_info
                } 
            finally:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }  
    