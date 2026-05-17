import { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Navbar(){
    const {logout}=useAuth();
    const {darkMode,toogleTheme}=useContext(ThemeContext);
    const navigate=useNavigate();
    const handleLogout=()=>{
        logout();
        navigate("/login");
        
        
    };
    return(
      
      <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center transition-colors">
           
               {/* Title */}

            <h2 className="text-2xl font-semibold">
                Project Dashboard
            </h2>
            
            {/* Right Side */}
          
          <div className="flex items-center gap-4">
            
            <button
          onClick={toogleTheme}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white transition-all"
        >
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
          
           {/* User Avatar */}

         <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            
            W

            </div>
            
            <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded">
                Logout
            
            </button>   
        
          </div>
        
        </header>
    );
}