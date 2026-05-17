const Task = require("../models/Task");
const Project = require("../models/Project");

exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const projectId = req.params.projectId;
        const userId = req.user.id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isMember = project.members.includes(userId) || project.owner.toString() === userId;
        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            project: projectId,
            createdBy: userId
        });

        
        const io = req.app.get("io");
        if (io) io.to(projectId).emit("taskCreated", task);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProjectTasks = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.user.id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isMember = project.members.includes(userId) || project.owner.toString() === userId;
        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        const tasks = await Task.find({ project: projectId })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const { title, description, priority, dueDate } = req.body;
        if (title) task.title = title;
        if (description) task.description = description;
        if (priority) task.priority = priority;
        if (dueDate) task.dueDate = dueDate;

        await task.save();

        
        const io = req.app.get("io");
        if (io) io.to(task.project.toString()).emit("taskUpdated", task); 
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.status = req.body.status;
        await task.save();

        
        const io = req.app.get("io");
        if (io) io.to(task.project.toString()).emit("taskUpdated", task); 
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.assignedTo = req.body.userId;
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const projectId = task.project.toString();
        const taskId = task._id.toString();

        await Task.deleteOne({ _id: taskId });

        
        const io = req.app.get("io");
        if (io) {
            io.to(projectId).emit("taskDeleted", taskId);
        }

        res.json({ message: "Task deleted successfully", id: taskId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};