import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Lock,
  Download,
  Eye,
  CheckCircle2,
  Filter,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { CourseDocument } from '../../../types';

interface UploadDocumentsScreenProps {
  documents: CourseDocument[];
  onAddDocument: (doc: CourseDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const UploadDocumentsScreen: React.FC<UploadDocumentsScreenProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // Form states for manual upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('ME-102');
  const [newCategory, setNewCategory] = useState<CourseDocument['category']>('Notes & Slides');
  const [lockAndWatermark, setLockAndWatermark] = useState(false);

  const categories = ['All', 'Notes & Slides', 'Question Paper', 'Lab Manual', 'Syllabus'];

  const filteredDocs = documents
    .filter((d) => selectedCategory === 'All' || d.category === selectedCategory)
    .filter((d) => selectedCourse === 'All' || d.courseCode === selectedCourse);

  const handleSimulatedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const mockFileTitle = 'ES-101_Lecture_Notes_Unit4_AC_Analysis.pdf';
    const newDoc: CourseDocument = {
      id: `doc-${Date.now()}`,
      title: mockFileTitle,
      courseCode: 'ES-101',
      category: 'Notes & Slides',
      fileSize: '4.1 MB',
      uploadedAt: 'Just now',
      status: 'Published',
      downloads: 0,
    };
    onAddDocument(newDoc);
    setUploadSuccessToast(`Uploaded and published: ${mockFileTitle}`);
    setTimeout(() => setUploadSuccessToast(null), 4000);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDoc: CourseDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.endsWith('.pdf') ? newTitle : `${newTitle}.pdf`,
      courseCode: newCourse,
      category: newCategory,
      fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      uploadedAt: 'Just now',
      status: lockAndWatermark ? 'Locked & Watermarked' : 'Published',
      downloads: 0,
    };

    onAddDocument(newDoc);
    setUploadSuccessToast(
      lockAndWatermark
        ? `Encrypted & Watermarked with Faculty Key: ${newDoc.title}`
        : `Successfully uploaded: ${newDoc.title}`
    );
    setTimeout(() => setUploadSuccessToast(null), 4000);

    setNewTitle('');
    setShowUploadModal(false);
  };

  return (
    <div id="upload-documents-screen" className="p-4 sm:p-6 lg:p-8 max-w-[1580px] mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#e2dfff] text-[#0f0069] font-bold">
              FACULTY REPOSITORY
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555]">
              Cloud ERP Document Vault & Secure Paper Bank
            </span>
          </div>
          <h1 className="font-['Sora'] text-2xl font-bold text-[#131b2e] mt-1">
            Academic Documents & Question Papers
          </h1>
          <p className="text-[14px] text-[#464555]">
            Upload handouts, lab manuals, and mid-term exam question papers with automatic cryptographic watermarking.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-lg bg-[#3525cd] text-white font-semibold text-[13px] flex items-center gap-2 shadow-xs hover:bg-[#3323cc] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {uploadSuccessToast && (
        <div className="p-3.5 bg-[#ecfdf5] border border-[#d1fae5] text-[#065f46] rounded-xl text-[13px] font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#006e4b]" />
          <span>{uploadSuccessToast}</span>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleSimulatedDrop}
        onClick={() => setShowUploadModal(true)}
        className="bg-white rounded-xl p-8 border-2 border-dashed border-[#c3c0ff] hover:border-[#3525cd] transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group shadow-xs"
      >
        <div className="w-14 h-14 rounded-full bg-[#e2dfff] text-[#3525cd] flex items-center justify-center group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-['Sora'] font-semibold text-[16px] text-[#131b2e]">
            Drag and drop lecture files or exam question papers here
          </h3>
          <p className="text-[13px] text-[#464555] mt-1">
            Supports PDF, DOCX, PPTX, IPYNB (Max size 50 MB). Question papers automatically encrypted.
          </p>
        </div>
        <span className="font-['JetBrains_Mono'] text-[11px] px-3 py-1 bg-[#f2f3ff] text-[#3525cd] rounded-md font-semibold">
          Click to Browse Files or Drop
        </span>
      </div>

      {/* Filter and Course Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#eaedff]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[12px] text-[#777587] font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#3525cd] text-white'
                  : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#777587]">Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-[12px] bg-[#f2f3ff] px-3 py-1 rounded-lg border border-[#e2e7ff] text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
          >
            <option value="All">All Courses</option>
            <option value="ME-102">ME-102 (Thermodynamics)</option>
            <option value="ES-101">ES-101 (Basic Electrical)</option>
            <option value="ES-101L">ES-101L (Hardware Lab)</option>
          </select>
        </div>
      </div>

      {/* Document Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const isLocked = doc.status === 'Locked & Watermarked';

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-xl p-5 shadow-sm border transition-all flex flex-col justify-between gap-4 ${
                isLocked ? 'border-[#ba1a1a]/30 bg-[#fffbfa]' : 'border-[#eaedff]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isLocked ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e2dfff] text-[#3525cd]'
                    }`}
                  >
                    {isLocked ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['JetBrains_Mono'] text-[11px] font-bold px-2 py-0.5 rounded bg-[#dae2fd] text-[#3525cd]">
                        {doc.courseCode}
                      </span>
                      <span className="text-[11px] font-medium text-[#777587]">
                        {doc.category}
                      </span>
                    </div>

                    <h4 className="font-semibold text-[14px] text-[#131b2e] mt-1 break-all">
                      {doc.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-[#464555] font-['JetBrains_Mono'] mt-1">
                      <span>{doc.fileSize}</span>
                      <span>•</span>
                      <span>Uploaded {doc.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isLocked ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#d1fae5] text-[#065f46]'
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f2f3ff] text-[12px]">
                <span className="text-[#777587] font-['JetBrains_Mono']">
                  {doc.downloads} downloads by students
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 rounded-lg text-[#777587] hover:text-[#ba1a1a] hover:bg-[#fff1f2] transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading: ${doc.title}`);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#3525cd]" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f2f3ff] pb-3 mb-4">
              <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                Upload Course Material
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#777587] hover:text-[#131b2e]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                  Document Title / File Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ME-102_Quiz_2_Solution_Key.pdf"
                  className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    Course Code
                  </label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] focus:outline-none"
                  >
                    <option value="ME-102">ME-102 (Thermodynamics)</option>
                    <option value="ES-101">ES-101 (Basic Electrical)</option>
                    <option value="ES-101L">ES-101L (Hardware Lab)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#131b2e] block mb-1">
                    Document Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg bg-[#f2f3ff] text-[13px] border border-[#e2e7ff] focus:outline-none"
                  >
                    <option value="Notes & Slides">Notes & Slides</option>
                    <option value="Question Paper">Question Paper</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Syllabus">Syllabus</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fffbfa] border border-[#ffdad6] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="lockWatermarkCheck"
                  checked={lockAndWatermark}
                  onChange={(e) => setLockAndWatermark(e.target.checked)}
                  className="mt-1 rounded text-[#ba1a1a] focus:ring-0 cursor-pointer w-4 h-4"
                />
                <label htmlFor="lockWatermarkCheck" className="text-[12px] text-[#131b2e] cursor-pointer">
                  <span className="font-semibold text-[#ba1a1a] block">
                    Lock & Watermark with Faculty Cryptographic Stamp
                  </span>
                  Applies visible dynamic watermark (Faculty ID, Print timestamp) to prevent mid-term question paper leakage.
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f3ff]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#464555] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#3525cd] text-white font-semibold text-[13px] hover:bg-[#3323cc]"
                >
                  Confirm & Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
