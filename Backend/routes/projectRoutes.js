const express=require("express");
const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");
const validate=require("../middleware/validate");
const {projectSchema}=require("../validators/projectValidator");

const {createProject,getProjects,getSingleProject,addMemberToProject,updateProject,deleteProject}=require("../controllers/projectController");
const {getDashboardAnalytics}=require("../controllers/projectController");


router.post("/",authMiddleware,createProject);
router.get("/",authMiddleware,getProjects);
router.get("/analytics/dashboard",authMiddleware,getDashboardAnalytics);
router.get("/:id",authMiddleware,getSingleProject);
router.post("/:id/add-member",authMiddleware,addMemberToProject);
router.put("/:id",authMiddleware,updateProject);
router.delete("/:id",authMiddleware,deleteProject);

module.exports=router;