"use client";

import { useState, useEffect } from "react";

// Task interface define
interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (): Promise<void> => {
    try {
      const response = await fetch("/api/tasks");
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create or Update task
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    if (!title.trim()) return;
    try {
      if (editingId) {
        // Update task
        const taskToUpdate = tasks.find((t) => t.id === editingId);
        await fetch(`/api/tasks/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            completed: taskToUpdate?.completed || false,
          }),
        });
        setEditingId(null);
      } else {
        // Create new task
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
      }
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // Edit task
  const handleEdit = (task: Task): void => {
    setTitle(task.title);
    setDescription(task.description || "");
    setEditingId(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete task
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure?")) return;

    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Toggle complete
  const toggleComplete = async (task: Task): Promise<void> => {
    try {
      await fetch(`/api/tasks/${task?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task?.description,
          completed: !task.completed,
        }),
      });
      fetchTasks();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setTitle("");
    setDescription("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2 text-gray-800">
          Task Manager
        </h1>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {editingId ? "Edit Task" : "Add new task"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                placeholder="Completed Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="Task Details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg"
              >
                {editingId ? "Update" : "+ Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tasks List */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Tasks ({tasks.length})
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-600">Empty!</p>
            <p className="text-gray-500 mt-2">Add new task</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={task?.completed}
                      onChange={() => toggleComplete(task)}
                      className="mt-1 w-5 h-5 cursor-pointer accent-blue-600"
                    />
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-semibold ${
                          task?.completed
                            ? "line-through text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        {task?.title}
                      </h3>
                      {task?.description && (
                        <p className="text-gray-600 mt-1">
                          {task?.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {task?.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
