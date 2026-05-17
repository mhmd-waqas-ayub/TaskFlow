import { Link,useLocation } from "react-router-dom";

export default function Sidebar(){
    const location=useLocation();

    const links=[
        {
            name:"Dashboard",
            path:"/"
        }
    ];
    return(
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg hidden md:flex flex-col transition-colors">
           
            {/* Logo */}
           
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold">
                    Task Flow
                </h1>
            </div>
           
           {/* Navigation */}
      
        <nav className="flex-1 p-4">
           
            {links.map(link=>(
                <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-lg mb-2 transition
                    ${location.pathname===link.path
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                    
                    `}
                    >
                        {link.name}
                    </Link>
            ))}
        </nav>
            
        </aside>
    );
}