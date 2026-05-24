import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// UPDATED: Removed "esm/" from the CSS import paths
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Fix for Vite/Webpack worker issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, onClose, fileUrl, fileName }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  if (!isOpen || !fileUrl) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">{fileName}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* PDF Document Area */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-4 flex justify-center min-h-[50vh]">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center text-gray-500 h-64">
                <Loader2 size={32} className="animate-spin mb-2" />
                <p>Loading document...</p>
              </div>
            }
            error={
              <div className="text-red-500 p-4 text-center">
                Failed to load PDF. Please ensure it is a valid document.
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-md bg-white"
              width={Math.min(window.innerWidth * 0.8, 800)}
            />
          </Document>
        </div>

        {/* Footer / Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Page {pageNumber} of {numPages || '--'}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => prev - 1)}
              className="p-2 border rounded-md disabled:opacity-50 hover:bg-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={numPages === null || pageNumber >= numPages}
              onClick={() => setPageNumber(prev => prev + 1)}
              className="p-2 border rounded-md disabled:opacity-50 hover:bg-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};