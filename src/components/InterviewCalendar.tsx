import React from "react";
import { 
  Calendar, 
  Clock, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  ListChecks, 
  Settings,
  X,
  AlertCircle
} from "lucide-react";
import { ScheduledInterview, PrepTask } from "../types";

interface CalendarProps {
  scheduled: ScheduledInterview[];
  onUpdateInterviews: (updated: ScheduledInterview[]) => void;
}

export default function InterviewCalendar({ scheduled, onUpdateInterviews }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDayInterviews, setSelectedDayInterviews] = React.useState<ScheduledInterview[]>([]);
  const [selectedInterview, setSelectedInterview] = React.useState<ScheduledInterview | null>(null);
  
  // Modal toggle state
  const [showAddModal, setShowAddModal] = React.useState(false);
  
  // New interview form state
  const [newCompany, setNewCompany] = React.useState("");
  const [newRole, setNewRole] = React.useState("");
  const [newTime, setNewTime] = React.useState("");
  const [newNotes, setNewNotes] = React.useState("");
  const [newColor, setNewColor] = React.useState("#6366f1");

  // Notifications authorization
  const [notificationGranted, setNotificationGranted] = React.useState(false);

  React.useEffect(() => {
    if ("Notification" in window) {
      setNotificationGranted(Notification.permission === "granted");
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotificationGranted(result === "granted");
    if (result === "granted") {
      new Notification("AI Interview Planner", {
        body: "Browser alerts configured successfully! We will ping you before upcoming interviews.",
      });
    }
  };

  // Calendar math
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Form submission: Schedule new interview
  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim() || !newTime) {
      alert("Please specify Company, Role, and Date/Time!");
      return;
    }

    // Standard starting checklist preparation tasks
    const initialTasks: PrepTask[] = [
      { id: "task_1", title: "Thoroughly research company core values, mission statement, and tech stack", completed: false, dueDate: newTime.split("T")[0], priority: "high" },
      { id: "task_2", title: "Practice 1 customized interactive AI Mock Interview practice session", completed: false, dueDate: newTime.split("T")[0], priority: "high" },
      { id: "task_3", title: "Audit portfolio/resume details and draft corresponding STAR anecdotes", completed: false, dueDate: newTime.split("T")[0], priority: "medium" },
      { id: "task_4", title: "Configure webcam environment, mic output levels, and practice posture on camera", completed: false, dueDate: newTime.split("T")[0], priority: "low" }
    ];

    const newItem: ScheduledInterview = {
      id: "int_" + Date.now(),
      company: newCompany,
      role: newRole,
      scheduledAt: new Date(newTime).toISOString(),
      notes: newNotes,
      color: newColor,
      tasks: initialTasks
    };

    const updatedList = [...scheduled, newItem];
    onUpdateInterviews(updatedList);

    // Reset Form
    setNewCompany("");
    setNewRole("");
    setNewTime("");
    setNewNotes("");
    setNewColor("#6366f1");
    setShowAddModal(false);

    // Schedule notification triggers
    if (notificationGranted) {
      const timeDiff = new Date(newItem.scheduledAt).getTime() - Date.now();
      // Notify 15 mins before if in future
      const alertOffset = 15 * 60 * 1000;
      if (timeDiff > alertOffset) {
        setTimeout(() => {
          new Notification("Upcoming Interview Alert!", {
            body: `Your mock preparation window is closing. Interview with ${newItem.company} for ${newItem.role} starts in 15 minutes!`,
          });
        }, timeDiff - alertOffset);
      }
    }
  };

  // Delete Interview
  const handleDeleteInterview = (id: string) => {
    if (confirm("Are you sure you want to delete this scheduled interview and its checklists?")) {
      const updated = scheduled.filter(i => i.id !== id);
      onUpdateInterviews(updated);
      if (selectedInterview?.id === id) {
        setSelectedInterview(null);
      }
    }
  };

  // Checklist Task toggler
  const toggleTask = (interviewId: string, taskId: string) => {
    const updated = scheduled.map(int => {
      if (int.id === interviewId) {
        return {
          ...int,
          tasks: int.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        };
      }
      return int;
    });
    onUpdateInterviews(updated);
    
    // Also keep selected synchronized
    const matching = updated.find(i => i.id === interviewId);
    if (matching) setSelectedInterview(matching);
  };

  // Task adder
  const [customTaskTitle, setCustomTaskTitle] = React.useState("");
  const handleAddCustomTask = (interviewId: string) => {
    if (!customTaskTitle.trim()) return;

    const newTask: PrepTask = {
      id: "task_" + Date.now(),
      title: customTaskTitle,
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium"
    };

    const updated = scheduled.map(int => {
      if (int.id === interviewId) {
        return {
          ...int,
          tasks: [...int.tasks, newTask]
        };
      }
      return int;
    });

    onUpdateInterviews(updated);
    setCustomTaskTitle("");
    const matching = updated.find(i => i.id === interviewId);
    if (matching) setSelectedInterview(matching);
  };

  const handleRemoveTask = (interviewId: string, taskId: string) => {
    const updated = scheduled.map(int => {
      if (int.id === interviewId) {
        return {
          ...int,
          tasks: int.tasks.filter(t => t.id !== taskId)
        };
      }
      return int;
    });
    onUpdateInterviews(updated);
    const matching = updated.find(i => i.id === interviewId);
    if (matching) setSelectedInterview(matching);
  };

  // Highlight days with scheduled items
  const getInterviewsOnDay = (day: number) => {
    return scheduled.filter(item => {
      const date = new Date(item.scheduledAt);
      return (
        date.getDate() === day &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-100 dark:border-slate-850 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="text-indigo-500" />
            Interview Preparation Roadmap
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
            Add target milestones to configure prep checklists and track focus countdown countdowns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!notificationGranted && (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Bell size={13} />
              Enable Alerts
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Plus size={13} />
            Schedule Target
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Grid: The Month Calendar Layout */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Grid Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayInterviews = getInterviewsOnDay(day);
              const hasInterviews = dayInterviews.length > 0;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => {
                    if (hasInterviews) {
                      setSelectedInterview(dayInterviews[0]);
                    }
                  }}
                  className={`aspect-square rounded-xl border flex flex-col justify-between p-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                    hasInterviews
                      ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900"
                      : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <span className={`text-[10px] font-bold ${hasInterviews ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}>
                    {day}
                  </span>

                  {hasInterviews && (
                    <div className="flex gap-1 justify-center">
                      {dayInterviews.map((int, idx) => (
                        <span
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: int.color }}
                          title={`${int.role} at ${int.company}`}
                        ></span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Selected Interview focus Details & Checklist */}
        <div className="lg:col-span-5">
          {selectedInterview ? (
            <div className="bg-slate-50/50 dark:bg-slate-850/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: selectedInterview.color }}
                  >
                    Target Milestone
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mt-2.5">
                    {selectedInterview.role}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">at {selectedInterview.company}</p>
                  
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1.5">
                    <Clock size={11} />
                    {new Date(selectedInterview.scheduledAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteInterview(selectedInterview.id)}
                  className="p-1 bg-white hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 rounded-lg transition-colors border border-slate-100 dark:border-slate-800"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {selectedInterview.notes && (
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Milestone Focus Notes</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic leading-normal">
                    "{selectedInterview.notes}"
                  </p>
                </div>
              )}

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase mb-1.5">
                  <span>Task Checklist Progress</span>
                  <span>
                    {Math.round(
                      (selectedInterview.tasks.filter(t => t.completed).length / selectedInterview.tasks.length) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{
                      width: `${
                        (selectedInterview.tasks.filter(t => t.completed).length / selectedInterview.tasks.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Task Checklist list */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <ListChecks size={13} />
                  Milestone Roadmap Tasks
                </p>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedInterview.tasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(selectedInterview.id, task.id)}
                      className="flex gap-2.5 items-start bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl cursor-pointer hover:border-slate-200 dark:hover:border-slate-750 transition-colors"
                    >
                      <button className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-indigo-500">
                        {task.completed ? (
                          <CheckSquare size={14} className="text-indigo-600" />
                        ) : (
                          <Square size={14} />
                        )}
                      </button>
                      <div className="flex justify-between items-start w-full gap-2">
                        <p className={`text-xs leading-tight font-medium ${task.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
                          {task.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTask(selectedInterview.id, task.id);
                          }}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom task creator */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={customTaskTitle}
                    onChange={e => setCustomTaskTitle(e.target.value)}
                    placeholder="Add bespoke roadmap checklist task..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    onKeyDown={e => {
                      if (e.key === "Enter") handleAddCustomTask(selectedInterview.id);
                    }}
                  />
                  <button
                    onClick={() => handleAddCustomTask(selectedInterview.id)}
                    className="p-2 bg-indigo-600 text-white rounded-lg transition-colors hover:bg-indigo-500"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 py-12 text-slate-400">
              <Calendar size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-xs">Milestone details inactive</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px] mt-1 leading-normal">
                Click on any days marked with color dots to customize prep tasks, notes, and countdown countdowns.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Interview Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleScheduleInterview}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Schedule Target Interview</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Job Position</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Target Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Milestone Focus Notes</label>
                <textarea
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. Emphasize Postgres scalability, concurrency hurdles, and distributed system logs."
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[60px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase">Accent Color Dot</label>
                <div className="flex gap-2 mt-1.5">
                  {["#6366f1", "#10b981", "#ef4444", "#f59e0b", "#ec4899"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className="w-5 h-5 rounded-full border border-slate-200 transition-all"
                      style={{
                        backgroundColor: c,
                        boxShadow: newColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                      }}
                    ></button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 font-semibold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95"
              >
                Schedule Target
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
