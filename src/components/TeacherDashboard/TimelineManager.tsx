import React, { useState } from 'react';
import { Subject, TimelineItem, ReferenceResource, TimelineType } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  Tag,
  CheckCircle,
  FileText,
  Bookmark,
  Layers,
  FlaskConical,
  Award
} from 'lucide-react';

interface TimelineManagerProps {
  activeSubject: Subject;
  timelines: TimelineItem[];
  resources: ReferenceResource[];
  onAddTimelineItem: (item: Partial<TimelineItem>) => Promise<void>;
  onDeleteTimelineItem: (itemId: string) => Promise<void>;
  onAddResource: (resource: Partial<ReferenceResource>) => Promise<void>;
  onGenerateAISyllabus: (courseName: string, description: string) => Promise<void>;
  isGeneratingSyllabus: boolean;
}

export const TimelineManager: React.FC<TimelineManagerProps> = ({
  activeSubject,
  timelines = [],
  resources = [],
  onAddTimelineItem,
  onDeleteTimelineItem,
  onAddResource,
  onGenerateAISyllabus,
  isGeneratingSyllabus
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'resources'>('timeline');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  // Form states for manual timeline item
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TimelineType>('quiz');
  const [date, setDate] = useState('2026-08-28');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:30 AM');
  const [location, setLocation] = useState('Academic Block A - Room 102');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState('');
  const [weightage, setWeightage] = useState('10');

  // Form states for AI Syllabus generator
  const [aiCourseName, setAiCourseName] = useState(activeSubject.name);
  const [aiCourseDesc, setAiCourseDesc] = useState(activeSubject.description);

  // Form states for Resource
  const [resTitle, setResTitle] = useState('');
  const [resCategory, setResCategory] = useState<'Textbook' | 'Lecture Notes' | 'Research Paper' | 'Video Guide' | 'Lab Manual'>('Textbook');
  const [resUrl, setResUrl] = useState('');
  const [resAuthor, setResAuthor] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resTopics, setResTopics] = useState('');

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddTimelineItem({
      title,
      type,
      date,
      startTime,
      endTime,
      location,
      description,
      topicsCovered: topics.split(',').map(t => t.trim()).filter(Boolean),
      weightagePercent: Number(weightage) || 0
    });
    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setTopics('');
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddResource({
      title: resTitle,
      category: resCategory,
      url: resUrl || '#',
      author: resAuthor,
      description: resDesc,
      keyTopics: resTopics.split(',').map(t => t.trim()).filter(Boolean)
    });
    setShowResourceModal(false);
    setResTitle('');
    setResDesc('');
    setResAuthor('');
    setResTopics('');
  };

  const handleRunAISyllabus = async () => {
    await onGenerateAISyllabus(aiCourseName, aiCourseDesc);
    setShowAIModal(false);
  };

  const getTypeBadge = (itemType: TimelineType) => {
    switch (itemType) {
      case 'exam':
        return { bg: 'bg-rose-950 text-rose-300 border-rose-800', icon: Award, label: 'Exam' };
      case 'quiz':
        return { bg: 'bg-amber-950 text-amber-300 border-amber-800', icon: CheckCircle, label: 'Quiz' };
      case 'practical':
        return { bg: 'bg-cyan-950 text-cyan-300 border-cyan-800', icon: FlaskConical, label: 'Practical Lab' };
      case 'assignment':
        return { bg: 'bg-indigo-950 text-indigo-300 border-indigo-800', icon: FileText, label: 'Assignment' };
      default:
        return { bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: BookOpen, label: 'Lecture' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm text-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-slate-950 text-purple-400 font-mono border border-slate-800">
              {activeSubject.code}
            </span>
            <h2 className="text-base font-bold uppercase tracking-tight text-white">
              Academic Timeline & Reference Manager
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            BML Munjal University · Manage course schedules, exams, practicals, and reference materials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Syllabus Generator Trigger */}
          <button
            id="timeline-open-ai-generator-btn"
            onClick={() => setShowAIModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Syllabus Generator</span>
          </button>

          {activeTab === 'timeline' ? (
            <button
              id="timeline-add-event-btn"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
          ) : (
            <button
              id="timeline-add-resource-btn"
              onClick={() => setShowResourceModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reference</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === 'timeline'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Calendar & Milestones ({timelines.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === 'resources'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Reference Materials ({resources.length})
        </button>
      </div>

      {/* Tab 1: Timeline Items List */}
      {activeTab === 'timeline' && (
        <div className="space-y-3">
          {timelines.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 rounded-md border border-dashed border-slate-800 p-8">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300 uppercase">No timeline items recorded</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Use the AI generator or add academic events manually.
              </p>
              <button
                onClick={() => setShowAIModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate with Gemini AI</span>
              </button>
            </div>
          ) : (
            timelines.map((item) => {
              const badge = getTypeBadge(item.type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 p-4 sm:p-5 rounded-md border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-100"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 border ${badge.bg}`}>
                      <BadgeIcon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-sm border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {item.weightagePercent !== undefined && item.weightagePercent > 0 && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-slate-950 text-slate-300 border border-slate-800">
                            Weight: {item.weightagePercent}%
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-white">
                          {item.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>

                      {/* Topics */}
                      {item.topicsCovered && item.topicsCovered.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.topicsCovered.map((t, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-sm bg-slate-950 text-slate-300 font-mono border border-slate-800"
                            >
                              <Tag className="w-2.5 h-2.5 text-slate-500" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[140px]">{item.location}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTimelineItem(item.id)}
                      className="p-1.5 rounded-sm text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Reference Materials */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-slate-900 p-5 rounded-md border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 text-slate-100"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-sm bg-blue-950 text-blue-300 border border-blue-800">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Added {res.dateAdded}</span>
                </div>

                <h4 className="font-bold text-sm text-white">
                  {res.title}
                </h4>

                <p className="text-xs text-slate-400 font-medium">
                  Author: <span className="text-slate-200">{res.author}</span>
                </p>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {res.description}
                </p>

                {res.keyTopics && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {res.keyTopics.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-950 text-slate-300 font-mono border border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-2 border-t border-slate-800"
              >
                <span>Access Resource</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Modal: AI Syllabus Generator */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-800 animate-in fade-in zoom-in-95 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-purple-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-tight text-white">
                  AI Course Curriculum & Milestone Generator
                </h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini will synthesize a balanced semester calendar with quizzes, practical lab sessions, problem sets, and examinations based on BML Munjal University course requirements.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Course Title</label>
                <input
                  type="text"
                  value={aiCourseName}
                  onChange={(e) => setAiCourseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Computer Programming in C"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Curriculum Scope & Key Objectives</label>
                <textarea
                  rows={4}
                  value={aiCourseDesc}
                  onChange={(e) => setAiCourseDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="Describe the main units, core topics, and evaluation goals..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAIModal(false)}
                className="px-3 py-1.5 rounded-sm text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunAISyllabus}
                disabled={isGeneratingSyllabus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 disabled:opacity-50 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingSyllabus ? 'Synthesizing...' : 'Generate Academic Calendar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Timeline Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateItem} className="bg-slate-900 rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-tight text-white">Add Academic Milestone / Event</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Midterm Written Examination"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Category Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TimelineType)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="quiz">Quiz</option>
                  <option value="exam">Major Exam</option>
                  <option value="practical">Practical Lab</option>
                  <option value="assignment">Assignment Due</option>
                  <option value="lecture">Special Lecture</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Weightage (%)</label>
                <input
                  type="number"
                  value={weightage}
                  onChange={(e) => setWeightage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Location / Room</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="Academic Block A - Room 102"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Topics Covered (comma-separated)</label>
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="Pointers, Dynamic Memory, Structs"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Instructions / Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="Coverage, calculators permitted, laboratory rules..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 rounded-sm text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700">
                Cancel
              </button>
              <button type="submit" className="px-3 py-1.5 rounded-sm bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 shadow-xs">
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Reference Resource */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateResource} className="bg-slate-900 rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-tight text-white">Add Course Reference Material</h3>
              <button type="button" onClick={() => setShowResourceModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. The C Programming Language (K&R)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Category</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Textbook">Textbook</option>
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Video Guide">Video Guide</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Author / Source</label>
                  <input
                    type="text"
                    value={resAuthor}
                    onChange={(e) => setResAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Kernighan & Ritchie"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">URL / Document Link</label>
                <input
                  type="url"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Key Topics (comma-separated)</label>
                <input
                  type="text"
                  value={resTopics}
                  onChange={(e) => setResTopics(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="Chapter 5, Pointers & Arrays, Memory Management"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Description & Study Guidance</label>
                <textarea
                  rows={2}
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="Relevant chapters and recommended reading sections..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowResourceModal(false)} className="px-3 py-1.5 rounded-sm text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700">
                Cancel
              </button>
              <button type="submit" className="px-3 py-1.5 rounded-sm bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 shadow-xs">
                Save Resource
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
