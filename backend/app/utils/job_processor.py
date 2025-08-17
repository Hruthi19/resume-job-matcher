#Job Description analyzer
import re
import nltk
import spacy
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from collections import Counter

class JobDescriptionProcessor:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_trf")
        except OSError:
            print("spacy model not found.")
            self.nlp = None
        
        try:
            self.stop_words = set(stopwords.words('english'))
        except LookupError:
            print("NLTK stopwords not found.")
            self.stop_words = set()
        
        #Common technical skills
        self.tech_skills = {
            'programming_languages': ['python', 'java', 'c++', 'javascript', 'c#', 'ruby', 'swift', 'php', 'go', 'rust', 'kotlin'],
            'frameworks': ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'ruby on rails', 'node.js', 'laravel'],
            'databases': ['mysql', 'mongodb', 'postgresql', 'sqlite', 'oracle', 'redis', 'elasticsearch'],
            'cloud_patforms': ['aws', 'azure', 'google cloud', 'ibm cloud', 'oracle cloud', 'gcp', 'docker', 'kubernetes', 'heroku'],
            'operating_systems': ['windows', 'linux', 'macos', 'unix'],
            'tools': ['git', 'github', 'jira', 'trello', 'jenkins', 'maven', 'gradle', 'npm', 'yarn', 'terraform', 'ansible', 'docker', 'kubernetes']
        }
        self.degrees = {"Bachelor's", "Master's", "PhD", "BSc", "MSc"}
    
    def clean_text(self, text):
        #Remove special characters and digits. Clean and normalize text

        if not text:
            return ""
        
        text = text.lower()
        text = re.sub(r'<[^>]+>','',text)
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        text = re.sub(r'\S+@\S+', '', text)
        text = re.sub(r'\s+', ' ', text).replace('\n', '. ')


        return text
    
    def extract_sentences(self, text):
        #Extract clean sentences from text
        if self.nlp:
            doc = self.nlp(text)
            return [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 1]
        else:
            try:
                return sent_tokenize(text)
            except:
                return [s.strip() for s in re.split(r'[.!?]\s+', text) if len(s.strip()) > 1]

    
    def tokenize_and_filter(self, text):
        #Tokenize text and filter out stopwords
        try:
            tokens = word_tokenize(text.lower())
        except:
            tokens = text.lower().split()
        
        filtered_tokens = [
            token for token in tokens
            if token.isalnum() and len(token) > 2 and token not in self.stop_words
        ]

        return filtered_tokens
    
    def extract_skills(self, text):
        #Extract technical skills from text
        text_lower = text.lower()
        found_skills = {category: [] for category in self.tech_skills}

        for category, skills in self.tech_skills.items():
            for skill in skills:
                if skill in text_lower:
                    found_skills[category].append(skill)

        return found_skills
    
    def extract_requirements(self, text):
        #Extract job requirements from text
        requirements = []

        requirement_patterns = [
            r'requirements?:?(.+?)(?=\n\n|\n[A-Z]|$)',
             r'qualifications?:?(.+?)(?=\n\n|\n[A-Z]|$)',
            r'you should have:?(.+?)(?=\n\n|\n[A-Z]|$)',
            r'we are looking for:?(.+?)(?=\n\n|\n[A-Z]|$)'
        ]

        for pattern in requirement_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
            requirements.extend(matches)
        
        return requirements
    
    def get_word_frequency(self, tokens, top_n = 20):
        #Get most frequency words
        word_freq = Counter(tokens)
        return word_freq.most_common(top_n)
    
    def extract_entities(self, text):
        if not self.nlp:
            return []

        doc = self.nlp(text)
        entities = []

        # spaCy base entities
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PERSON', 'GPE', 'LOC', 'PRODUCT']:
                entities.append({
                    'text': ent.text,
                    'label': ent.label_,
                    'description': spacy.explain(ent.label_)
                })

        # TECH skills
        all_skills = [s for skills_list in self.tech_skills.values() for s in skills_list]
        for skill in all_skills:
            for match in re.finditer(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                entities.append({
                    'text': match.group(),
                    'label': 'TECH',
                    'description': 'Technical Skill'
                })

        # Degrees
        for degree in self.degrees:
            for match in re.finditer(r'\b' + re.escape(degree) + r'\b', text, re.IGNORECASE):
                entities.append({
                    'text': match.group(),
                    'label': 'DEGREE',
                    'description': 'Academic Degree'
                })

        # Remove unwanted matches
        filtered_entities = [
            e for e in entities
            if not re.match(r'Key Responsibilities|Required Skills|Qualifications|Responsibilities', e['text'], re.IGNORECASE)
        ]

        # Remove duplicates
        unique_entities = {f"{e['text']}_{e['label']}": e for e in filtered_entities}.values()

        return list(unique_entities)

    
    def process_job_description(self, job_text):
        #Process job description
        try:
            cleaned_text = self.clean_text(job_text)

            sentences = self.extract_sentences(cleaned_text)

            tokens = self.tokenize_and_filter(cleaned_text)

            skills = self.extract_skills(job_text)

            requirements = self.extract_requirements(job_text)

            word_freq = self.get_word_frequency(tokens)

            entities = self.extract_entities(cleaned_text)

            return {
                'success': True,
                'data': {
                    'original_text': job_text,
                    'cleaned_text': cleaned_text,
                    'word_count': len(job_text.split()),
                    'sentence_count': len(sentences),
                    'sentences': sentences[:5],
                    'tokens': tokens[:50],
                    'skills': skills,
                    'requirements': requirements,
                    'top_words': word_freq,
                    'entities': entities[:10]
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
