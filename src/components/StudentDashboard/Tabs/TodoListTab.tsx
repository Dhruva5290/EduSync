import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  List,
  Calendar as CalendarIcon,
  Check
} from 'lucide-react';

interface TodoTask {
  id: string;
  title: string;
  dueDate: string;
  dateStr: string;
  priority: 'High' | 'Medium' | 'Low';
  subject: string;
  completed: boolean;
}

export const TodoListTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'cal'>('list');

  const [tasks, setTasks] = useState<TodoTask[]>(() => {
    try {
      const saved = localStorage.getItem('edusync_personal_todos');
      if (saved) return JSON.parse(saved);
    } catch {}
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const in3Days = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    return [
      { id: 't-1', title: 'Review Free Body Diagram notes', dueDate: 'Tomorrow', dateStr: tomorrow, priority: 'High', subject: 'Physics', completed: false },
      { id: 't-2', title: 'Complete Calculus limit problem set', dueDate: 'In 3 days', dateStr: in3Days, priority: 'Medium', subject: 'Math', completed: false },
      { id: 't-3', title: 'Watch rotational motion concept animation', dueDate: 'Friday', dateStr: today, priority: 'Low', subject: 'Physics', completed: true },
    ];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newDueDate, setNewDueDate] = useState('Tomorrow');
  const [newSubject, setNewSubject] = useState('Physics');

  useEffect(() => {
    localStorage.setItem('edusync_personal_todos', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const task: TodoTask = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      dueDate: newDueDate,
      dateStr: new Date().toISOString().split('T')[0],
      priority: newPriority,
      subject: newSubject,
      completed: false
    };
    setTasks(prev => [task, ...prev]);
    setNewTitle('');
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="flex flex-col w-full px-6 lg:px-8 py-6 gap-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Card */}
      <section className="bg-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#006947] shadow-2xs shrink-0 text-xl font-bold">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">To-Do List & Study Deadlines</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Organize personal study goals, assignment milestones, and calendar tasks</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-full shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              type="button"
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('cal')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cal'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              type="button"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar View</span>
            </button>
          </div>

          <div className="bg-blue-50 px-4 py-1.5 rounded-full flex items-center">
            <span className="text-xs font-bold text-[#0051d5] tracking-wide">{pendingCount} Pending</span>
          </div>
        </div>
      </section>

      {/* Task Creation Card */}
      <section className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4 border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full bg-slate-50 rounded-2xl px-4 py-2.5 flex items-center border border-slate-200/80">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new study goal or revision task..."
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#0b1c30] placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleAddTask}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#0051d5] hover:bg-blue-700 active:scale-95 text-white px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Metadata Filter Selector Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
          {/* Priority */}
          <div className="flex items-center gap-2">
            <span>Priority:</span>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="bg-slate-50 rounded-xl px-3 py-1.5 text-slate-800 border border-slate-200 font-semibold cursor-pointer outline-none"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2">
            <span>Subject:</span>
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="bg-slate-50 rounded-xl px-3 py-1.5 text-slate-800 border border-slate-200 font-semibold cursor-pointer outline-none"
            >
              <option value="Physics">Physics</option>
              <option value="Math">Math</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2">
            <span>Due Date:</span>
            <input
              type="text"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="bg-slate-50 rounded-xl px-3 py-1.5 text-slate-800 border border-slate-200 font-semibold w-28 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Task List Container */}
      <section className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-3 border border-slate-100">
        {tasks.map(task => {
          let priorityClasses = 'bg-orange-100 text-[#a33900]';
          if (task.priority === 'High') priorityClasses = 'bg-red-50 text-rose-700';
          if (task.priority === 'Low') priorityClasses = 'bg-blue-50 text-[#0051d5]';

          return (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => toggleComplete(task.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    task.completed
                      ? 'bg-[#006947] text-white shadow-2xs'
                      : 'bg-slate-100 text-transparent hover:bg-slate-200 border border-slate-200'
                  }`}
                  type="button"
                >
                  <Check className="w-4 h-4 text-white" />
                </button>

                <div className="flex flex-col min-w-0">
                  <span className={`text-xs sm:text-sm font-bold text-[#0b1c30] truncate ${
                    task.completed ? 'line-through text-slate-400' : ''
                  }`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600">{task.subject}</span>
                    <span className="text-[11px] text-slate-400">Due: {task.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${priorityClasses}`}>
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-full cursor-pointer"
                  title="Delete Task"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
