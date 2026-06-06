const Project = require("../models/Project");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

exports.createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({
            message: "Both fields are required"
        });
    }

    const project = await Project.create({
        name,
        description,
        owner: req.user.id,
        members: [req.user.id]
    });

    res.status(200).json({
        message: "Project created successfully",
        project
    });
});

exports.getProjects = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Change variable name to 'projects' (plural)
    const projects = await Project.find({
        $or: [
            { owner: userId },
            { members: userId }
        ]
    })
    .populate("owner", "name email")
    .populate("members", "name email")
    .sort({ createdAt: -1 });

    res.status(200).json({
        count: projects.length,
        projects   
    });
});

exports.getSingleProject = asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findById(projectId)
    .populate("owner", "name email role")
    .populate("members", "name email");

    if (!project) {
        return res.status(404).json({
            message: "Project Not Found"
        });
    }

    const isOwner = project.owner._id.toString() === userId;
    
    const isMember = project.members.some(member =>
        member._id.toString() === userId
    );

    if (!isOwner && !isMember) {
        return res.status(403).json({
            message: "Acess Denied"
        });
    }

    res.status(200).json(project);
});


exports.addMemberToProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { userId } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // only owner allowed
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only project owner can add members"
            });
        }

        // check duplicate
        const exists = project.members.some(
            (m) => m.toString() === userId
        );

        if (exists) {
            return res.status(400).json({
                message: "User already in project"
            });
        }

        project.members.push(userId);
        await project.save();

        res.status(200).json({
            message: "Member added successfully",
            project
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


exports.updateProject = asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const userId = req.user.id;
 
    const { name, description, status } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({
            message: "Project Not Found"
        });
    }

    if (project.owner.toString() !== userId) {
        return res.status(403).json({
            message: "Only Owner Can Update"
        });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;

    await project.save();

    res.status(200).json({
        message: "Updated Successfully",
        project
    });
});

exports.deleteProject = asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({
            message: "Project Not Found"
        });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            message: "Only Admin and Owner Deleted"
        });
    }

    // await project.findByIdAndDelete(projectId);
    await project.deleteOne();

    res.status(200).json({
        message: "Project Deleted Successfully",
        project
    });
});

exports.getDashboardAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    // User Projects
    const projects = await Project.find({
        $or: [
            { owner: userId },
            { members: userId }
        ]
    });

    const projectIds = projects.map(
        project => project._id
    );

    // Tasks
    const tasks = await Task.find({
        project: { $in: projectIds }
    });

    // Totals:
    const totalProjects = projects.length;
    const totalTasks = tasks.length;  
 
    const completedTasks = tasks.filter(task => task.status === "completed").length;
    const inProgressTasks = tasks.filter(task => task.status === "in-progress").length;
    const todoTasks = tasks.filter(task => task.status === "todo").length;

    // Productivity:
    const productivity = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);
    
    res.json({
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        productivity
    });
});