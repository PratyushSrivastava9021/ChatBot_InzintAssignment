import React, { useState } from 'react';
import { uploadPDF, MAX_FILE_SIZE } from '../../config/api';

const PDFUpload = ({ onUploadSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setUploadStatus('File too large. Maximum size is 10MB.');
        setFile(null);
      } else {
        setFile(selectedFile);
        setUploadStatus('');
      }
    } else {
      setUploadStatus('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus('Uploading and processing PDF...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadPDF(file);
      setUploadStatus(`✅ ${result.message}`);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-md w-full border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 inline-block text-transparent bg-clip-text">
            Upload PDF
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-blue-600 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-gray-300 mb-2">Click to select PDF file</p>
              <p className="text-sm text-gray-500">Max size: 10MB</p>
            </label>
          </div>

          {file && (
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Selected: {file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {uploadStatus && (
            <div className={`p-3 rounded-lg text-sm ${
              uploadStatus.includes('✅') ? 'bg-green-900/30 text-green-400' :
              uploadStatus.includes('❌') ? 'bg-red-900/30 text-red-400' :
              'bg-blue-900/30 text-blue-400'
            }`}>
              {uploadStatus}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-all font-medium"
            >
              {uploading ? 'Processing...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          PDF content will be indexed for AI responses
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;