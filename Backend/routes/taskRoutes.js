const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createTask,
    getProjectTasks,
    updateTask,
    updateTaskStatus,
    assignTask,
    deleteTask
} = require("../controllers/taskController");

router.post("/:projectId", authMiddleware, createTask);

router.get("/project/:projectId", authMiddleware, getProjectTasks);

router.put("/:id", authMiddleware, updateTask);

router.patch("/:id/status", authMiddleware, updateTaskStatus);

router.patch("/:id/assign", authMiddleware, assignTask);

router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;