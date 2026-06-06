const Task = require("../models/Task");
const Project = require("../models/Project");

// ==========================
// CREATE TASK
// ==========================
exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const projectId = req.params.projectId;
        const userId = req.user.id;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isMember =
            project.owner.toString() === userId ||
            project.members.some(m => m.toString() === userId);

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

// ==========================
// GET PROJECT TASKS
// ==========================
exports.getProjectTasks = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.user.id;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isMember =
            project.owner.toString() === userId ||
            project.members.some(m => m.toString() === userId);

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

// ==========================
// UPDATE TASK
// ==========================
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const project = await Project.findById(task.project);

        const userId = req.user.id;

        const isMember =
            project.owner.toString() === userId ||
            project.members.some(m => m.toString() === userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

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

// ==========================
// UPDATE TASK STATUS
// ==========================
exports.updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const project = await Project.findById(task.project);

        const userId = req.user.id;

        const isMember =
            project.owner.toString() === userId ||
            project.members.some(m => m.toString() === userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        task.status = req.body.status;

        await task.save();

        const io = req.app.get("io");
        if (io) io.to(task.project.toString()).emit("taskUpdated", task);

        res.json(task);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// ASSIGN TASK
// ==========================
exports.assignTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const project = await Project.findById(task.project);

        const userId = req.user.id;
        const targetUserId = req.body.userId;

        const isMember =
            project.owner.toString() === userId ||
            project.members.some(m => m.toString() === userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        const isValidTarget =
            project.owner.toString() === targetUserId ||
            project.members.some(m => m.toString() === targetUserId);

        if (!isValidTarget) {
            return res.status(400).json({
                message: "User not part of project"
            });
        }

        task.assignedTo = targetUserId;

        await task.save();

        const io = req.app.get("io");
        if (io) io.to(task.project.toString()).emit("taskAssigned", task);

        res.json(task);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// DELETE TASK
// ==========================
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const project = await Project.findById(task.project);

        const userId = req.user.id;

        const isMember =
            project.owner.toString() === userId ||
            project.members.some(m => m.toString() === userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        await task.deleteOne();

        const io = req.app.get("io");
        if (io) io.to(project._id.toString()).emit("taskDeleted", task._id);

        res.json({ message: "Task deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};