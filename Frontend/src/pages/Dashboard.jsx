import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AnalyticsCharts from "../components/AnalyticsCharts";
import StatsCard from "../components/StatsCard";
import { toast } from "react-hot-toast";
import ButtonLoader from "../components/buttonLoader";
import SkeletonCard from "../components/SkeltonCard";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get("/projects");
        setProjects(res.data.projects);
      
        const analyticsRes = await api.get("/projects/analytics/dashboard");
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Project name is required");

    try {
      setCreating(true);
      await api.post("/projects", {
        name,
        description
      });
      
      toast.success("Project created successfully");
      setName("");
      setDescription("");
      
      // Refresh list after creation
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>  
        <p className="text-gray-500">Manage Your Projects and Tasks</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Tasks" value={analytics?.totalTasks || 0} />
        <StatsCard title="Completed Tasks" value={analytics?.completedTasks || 0} />
        <StatsCard title="Productivity" value={`${analytics?.productivity || 0}`} />
      </div>
     
      {analytics && (
        <div className="mb-8">
          <AnalyticsCharts analytics={analytics} />
        </div>
      )}

      {/* CREATE PROJECT */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 hover:shadow-2xl hover:scale-[1.01] transition-all">
        <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>

        <form onSubmit={createProject} className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Project name"
            className="border p-3 rounded-lg text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button 
            type="submit"
            disabled={creating}
            className="bg-blue-500 hover:bg-blue-600 font-medium text-white rounded-lg flex justify-center items-center gap-2 disabled:opacity-50 p-3 text-sm transition-colors"
          >
            {creating ? <ButtonLoader /> : "Create Project"}
          </button>
        </form>
      </div>

      {/* PROJECT GRID */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">No Project Yet</h2>
          <p className="text-gray-500">Create Your First Project</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition border border-transparent dark:border-gray-700"
            >
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">{project.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full dark:text-gray-300 capitalize">
                  {project.status}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  Members: {project.members?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}