import PyPDF2
import io
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"

class PDFProcessor:
    def __init__(self):
        os.makedirs(UPLOADS_DIR, exist_ok=True)
    
    def extract_text_from_pdf(self, pdf_content):
        """Extract text from uploaded PDF file content"""
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def save_pdf_content(self, filename, content):
        """Save extracted PDF content to text file"""
        try:
            pdf_content_dir = BASE_DIR / "data" / "pdf_content"
            os.makedirs(pdf_content_dir, exist_ok=True)
            
            # Create text file with same name as PDF
            text_filename = filename.replace('.pdf', '.txt')
            filepath = pdf_content_dir / text_filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return str(filepath)
        except Exception as e:
            raise Exception(f"Error saving PDF content: {str(e)}")