import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({children}){
    return(
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black
        dark:text-white transition-colors">

            <Sidebar/>
           
           {/* Main Content */}
            <div className="flex-1 flex flex-col">
                
                <Navbar/>
            
            {/* Page Content */}
            <main className="p-6">
                {children}
            
            </main>
            
            </div>
        
        </div>
    );
}