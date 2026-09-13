import React, { useState } from 'react';
import {
  CheckSquare,
  Calendar,
  List,
  Plus,
  Trash2,
  Check,
  Tag,
  Clock,
} from 'lucide-react';
import { TodoTask } from '../types';

interface TodoListViewProps {
  todos: TodoTask[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (task: Omit<TodoTask, 'id' | 'completed'>) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoListView: React.FC<TodoListViewProps> = ({
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [subject, setSubject] = useState('Physics');
  const [dueDate, setDueDate] = useState('Tomorrow');

  const pendingCount = todos.filter((t) => !t.completed).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTodo({
      title: newTaskTitle.trim(),
      priority,
      subject,
      dueDate,
    });
    setNewTaskTitle('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1520px] mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6ffbbe]/30 text-[#006947] flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
              To-Do List & Study Deadlines
            </h1>
            <p className="text-xs text-[#5a4138]">
              Organize personal study goals, assignment milestones, and calendar tasks
            </p>
          </div>
        </div>

        {/* View Mode Controls & Pending count */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#eff4ff] p-1 rounded-full border border-[#dce9ff]/60">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-[#5a4138] hover:text-[#0b1c30]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-[#5a4138] hover:text-[#0b1c30]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>

          <span className="px-3 py-1.5 rounded-full bg-[#dbe1ff] text-[#003ea8] text-xs font-bold">
            {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* Add New Task Input Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-5 lg:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new study goal or revision task..."
            className="w-full bg-[#eff4ff] px-4 py-3 rounded-2xl text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#5a4138] outline-none border border-[#dce9ff] focus:ring-2 focus:ring-[#0051d5]/30 font-medium"
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#0051d5] hover:bg-[#003ea8] text-white px-6 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Task Properties Row */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-[#5a4138]">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Priority:</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="bg-[#eff4ff] text-[#0b1c30] font-bold px-3 py-1 rounded-full border border-[#dce9ff] outline-none cursor-pointer"
            >
              <option value="High">🔴 High</option>
              <option value="Medium">🟠 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Subject:</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-[#eff4ff] text-[#0b1c30] font-bold px-3 py-1 rounded-full border border-[#dce9ff] outline-none cursor-pointer"
            >
              <option value="Physics">Physics</option>
              <option value="Math">Math</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Due Date:</span>
            <select
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-[#eff4ff] text-[#0b1c30] font-bold px-3 py-1 rounded-full border border-[#dce9ff] outline-none cursor-pointer"
            >
              <option value="Tomorrow">Tomorrow</option>
              <option value="In 3 days">In 3 days</option>
              <option value="Friday">Friday</option>
              <option value="Next Week">Next Week</option>
            </select>
          </div>
        </div>
      </form>

      {/* View Switch: List vs Calendar */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-3">
          {todos.map((task) => {
            const isHigh = task.priority === 'High';
            const isMed = task.priority === 'Medium';

            return (
              <div
                key={task.id}
                className="group p-4 rounded-2xl hover:bg-[#eff4ff]/60 border border-[#eff4ff] flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => onToggleTodo(task.id)}
                    type="button"
                    aria-label="Toggle task completion"
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                      task.completed
                        ? 'bg-[#006947] text-white'
                        : 'border-2 border-[#dce9ff] bg-[#eff4ff] hover:border-[#006947]'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-sm font-semibold transition-all ${
                        task.completed
                          ? 'line-through text-gray-400 font-normal'
                          : 'text-[#0b1c30]'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[11px] text-[#5a4138]">
                      {task.subject} • Due: {task.dueDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                      isHigh
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : isMed
                        ? 'bg-[#ffdbce] text-[#7f2b00]'
                        : 'bg-[#dbe1ff] text-[#003ea8]'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => onDeleteTodo(task.id)}
                    className="text-gray-400 hover:text-[#ba1a1a] p-1.5 rounded-full hover:bg-white transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0b1c30]">
              Study Schedule • September 2026
            </h3>
            <span className="text-xs text-[#5a4138]">Synchronized with Google Calendar</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#5a4138] pb-2 border-b border-[#eff4ff]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span className="text-[#0051d5]">Sat (Today)</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-2 min-h-[220px]">
            {['11', '12', '13', '14', '15', '16', '17'].map((d, dIdx) => (
              <div
                key={d}
                className={`p-2 rounded-2xl border flex flex-col gap-1.5 text-xs ${
                  d === '16'
                    ? 'bg-[#eff4ff] border-[#0051d5]/40 shadow-xs'
                    : 'bg-[#f8f9ff] border-[#eff4ff]'
                }`}
              >
                <span
                  className={`font-bold ${
                    d === '16' ? 'text-[#0051d5]' : 'text-[#5a4138]'
                  }`}
                >
                  {d}
                </span>

                {dIdx === 1 && (
                  <span className="text-[10px] font-medium bg-[#ffdbce] text-[#7f2b00] p-1 rounded-lg">
                    Free Body Diagram notes
                  </span>
                )}
                {dIdx === 3 && (
                  <span className="text-[10px] font-medium bg-[#dbe1ff] text-[#003ea8] p-1 rounded-lg">
                    Calculus Problem Set
                  </span>
                )}
                {dIdx === 5 && (
                  <span className="text-[10px] font-medium bg-[#6ffbbe]/30 text-[#005236] p-1 rounded-lg">
                    Classroom Sync
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
