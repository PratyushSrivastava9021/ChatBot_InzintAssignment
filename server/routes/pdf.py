from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from utils.pdf_processor import PDFProcessor
from utils.embeddings import EmbeddingStore

router = APIRouter()
pdf_processor = PDFProcessor()

class PDFUploadResponse(BaseModel):
    message: str
    filename: str
    pages_processed: int

@router.post("/upload-pdf", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Read file content
        content = await file.read()
        
        # Extract text from PDF
        text_content = pdf_processor.extract_text_from_pdf(content)
        
        if not text_content.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        # Save PDF content
        pdf_processor.save_pdf_content(file.filename, text_content)
        
        # Rebuild embeddings index to include new PDF
        embedding_store = EmbeddingStore()
        
        # Build index including both knowledge_base and pdf_content
        kb_dir = BASE_DIR.parent / "data" / "knowledge_base"
        pdf_dir = BASE_DIR.parent / "data" / "pdf_content"
        
        result = embedding_store.build_combined_index([str(kb_dir), str(pdf_dir)])
        embedding_store.save()
        
        # Count pages (rough estimate)
        pages_count = len(text_content.split('\n\n'))
        
        return PDFUploadResponse(
            message=f"PDF '{file.filename}' uploaded and indexed successfully",
            filename=file.filename,
            pages_processed=pages_count
        )
        
    except Exception as e:
        print(f"PDF upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))