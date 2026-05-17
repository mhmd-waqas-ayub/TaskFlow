/* eslint-disable react-refresh/only-export-components */
import { createContext,useState,useEffect } from "react";

export const ThemeContext=createContext();

export default function ThemeProvider({children}){
    
    const [darkMode,setDarkMode]=useState(()=>{
        return localStorage.getItem("theme")==="dark";
    })
   useEffect(()=>{
    if(darkMode){
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme","dark")
    }

     else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme","light");
    };


   },[darkMode]);

   const toogleTheme=()=>{
    setDarkMode(prev=> !prev)
   };

   return(
    <ThemeContext.Provider
    value={{
        darkMode,
        toogleTheme
    }}>
        {children}
    </ThemeContext.Provider>
   )

}
    
