// src/components/TestDocument.tsx
import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import DocumentPreview from './Common/DocumentPreview';

const TestDocument = () => {
  const [showPreview, setShowPreview] = useState(false);
  
  const testDoc = {
    id: 'test',
    nom: 'test.pdf',
    fichier: '/media/documents/test.pdf',
    url: 'http://localhost:8000/media/documents/test.pdf',
    type_document: 'PDF',
    taille: 1024,
    created_at: new Date().toISOString()
  };

  return (
    <div className="p-8">
      <button
        onClick={() => setShowPreview(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Eye size={18} />
        Tester preview
      </button>
      
      {showPreview && (
        <DocumentPreview
          document={testDoc}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default TestDocument;