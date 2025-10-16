from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from utils.pdf_processor import PDFProcessor

router = APIRouter()
pdf_processor = PDFProcessor()

class PDFProcessResponse(BaseModel):
    content: str
    filename: str

@router.post("/process-pdf", response_model=PDFProcessResponse)
async def process_pdf(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        content = await file.read()
        text_content = pdf_processor.extract_text_from_pdf(content)
        
        if not text_content.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        return PDFProcessResponse(
            content=text_content,
            filename=file.filename
        )
        
    except Exception as e:
        print(f"PDF processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))