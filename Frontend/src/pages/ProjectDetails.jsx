import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH PROJECT + TASKS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectRes = await api.get(`/projects/${id}`);
        const taskRes = await api.get(`/tasks/project/${id}`);

        setProject(projectRes.data);
        setTasks(taskRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // SOCKET MANAGEMENT
  useEffect(() => {
    socket.emit("joinProject", id);

    socket.on("taskCreated", (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    socket.on("taskDeleted", (taskId) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, [id]);

  // CREATE TASK
  const createTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.post(`/tasks/${id}`, {
        title,
        description,
        priority,
      });
     toast.success("Task created successfully")
      setTitle("");
      setDescription("");
      setPriority("medium");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Create Task")
    }
  };

  // DELETE TASK
  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    toast.success("Task deleted successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete task")
    }
  };

  // DRAG & DROP HANDLER
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    const updatedTasks = tasks.map((task) =>
      task._id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
      const res = await api.get(`/tasks/project/${id}`);
      setTasks(res.data);
    }
  };

  // GROUP TASKS BY STATUS
  const columns = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done" || task.status === "completed"),
  };

  if (loading) return <div className="p-6">
    <Loader/>
  </div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{project?.name}</h1>
        <p className="text-gray-600 mb-2">{project?.description}</p>
        <div className="text-sm text-gray-500">Status: {project?.status}</div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Team Members</h2>
        <div className="flex flex-wrap gap-3">
          {project?.members?.map((member) => (
            <div key={member._id} className="border px-3 py-2 rounded bg-gray-50">
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-gray-500">{member.email}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create Task</h2>
        <form onSubmit={createTask} className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            placeholder="Task title"
            className="border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="bg-blue-500 text-white rounded px-4 py-2">
            Add Task
          </button>
        </form>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([status, columnTasks]) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 rounded-lg p-4 min-h-[500px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold capitalize">{status}</h2>
                    <span className="bg-white px-2 py-1 rounded text-sm">
                      {columnTasks.length}
                    </span>
                  </div>

                  {columnTasks.map((task, index) => (
                    <Draggable draggableId={task._id} index={index} key={task._id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white rounded-lg shadow p-4 mb-4"
                        >
                          <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          <div className="text-xs mb-2">Priority: {task.priority}</div>
                          {task.assignedTo && (
                            <div className="text-xs mb-2">
                              Assigned To: {task.assignedTo.name}
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="text-xs mb-3">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => deleteTask(task._id)}
                              className="text-red-500 text-sm hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}