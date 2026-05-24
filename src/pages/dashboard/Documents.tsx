import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, CheckCircle, Clock, X, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { PDFViewerModal } from '../../components/documents/PDFViewerModal'; // NEW: Import the modal

export const Documents: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Upload Modal State ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('Pitch Deck');
  const [isUploading, setIsUploading] = useState(false);

  // --- Signature Modal State ---
  const [signingDocId, setSigningDocId] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [uploadingSig, setUploadingSig] = useState(false);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // --- NEW: PDF Viewer Modal State ---
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [selectedDocName, setSelectedDocName] = useState<string>('');

  // 1. Fetch Documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('business_nexus_token');
      const res = await fetch('https://nexus-backend-jlqe.onrender.com/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 2. Handle Initial Document Upload
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return;

    setIsUploading(true);
    const token = localStorage.getItem('business_nexus_token');
    
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('documentType', uploadType);

    try {
      const res = await fetch('https://nexus-backend-jlqe.onrender.com/api/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        await fetchDocuments(); 
        setIsUploadModalOpen(false); 
        setUploadFile(null); 
        setUploadTitle('');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to upload document", error);
      alert("Upload failed. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Handle Signature Upload
  const handleSignDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureFile || !signingDocId) return;

    setUploadingSig(true);
    const token = localStorage.getItem('business_nexus_token');
    
    const formData = new FormData();
    formData.append('signature', signatureFile);

    try {
      const res = await fetch(`https://nexus-backend-jlqe.onrender.com/api/documents/${signingDocId}/sign`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        await fetchDocuments();
        setSigningDocId(null);
        setSignatureFile(null);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to upload signature", error);
    } finally {
      setUploadingSig(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secure Data Room</h1>
          <p className="text-gray-500">Manage and sign your confidential documents.</p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Upload size={18} />} 
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload Document
        </Button>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="text-center text-gray-500 mt-10">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg border border-gray-200 shadow-sm text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No documents found in your Data Room.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col relative overflow-hidden">
              
              {/* Status Badge */}
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1 ${
                doc.status === 'Signed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {doc.status === 'Signed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                {doc.status}
              </div>

              <div className="flex items-start gap-4 mb-4 mt-2">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 truncate" title={doc.title}>{doc.title}</h3>
                  <p className="text-sm text-gray-500">{doc.documentType}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                {/* NEW: View Doc Button triggers Modal instead of new tab */}
                <button 
                  onClick={() => {
                    setSelectedDocUrl(`https://nexus-backend-jlqe.onrender.com${doc.fileUrl}`);
                    setSelectedDocName(doc.title);
                    setIsViewerOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                >
                  <Eye size={16} />
                  View Doc
                </button>
                
                {doc.status !== 'Signed' && (
                  <button 
                    onClick={() => setSigningDocId(doc._id)}
                    className="flex-1 text-center py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Sign
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- UPLOAD DOCUMENT MODAL --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Upload New Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUploadDocument} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                <input 
                  type="text" 
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                  placeholder="e.g., Q3 Financial Projections"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select 
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary-500 bg-white"
                >
                  <option value="Pitch Deck">Pitch Deck</option>
                  <option value="Financial Model">Financial Model</option>
                  <option value="Legal">Legal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF, DOCX)</label>
                <input 
                  type="file" 
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button variant="outline" type="button" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={!uploadFile || !uploadTitle || isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- E-SIGNATURE MODAL --- */}
      {signingDocId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">E-Sign Document</h3>
              <button onClick={() => setSigningDocId(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSignDocument} className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please upload an image of your signature (PNG, JPG) to officially sign this document.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg"
                  className="hidden" 
                  ref={sigInputRef}
                  onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                />
                
                {signatureFile ? (
                  <div className="text-sm text-green-600 font-medium flex flex-col items-center gap-2">
                    <CheckCircle size={24} />
                    {signatureFile.name}
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => sigInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Click to browse for signature image
                  </button>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" type="button" onClick={() => setSigningDocId(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={!signatureFile || uploadingSig}>
                  {uploadingSig ? 'Signing...' : 'Confirm Signature'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW: PDF VIEWER MODAL INJECTED HERE --- */}
      <PDFViewerModal 
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileUrl={selectedDocUrl}
        fileName={selectedDocName}
      />

    </div>
  );
};