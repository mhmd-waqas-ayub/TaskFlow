import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {  useAuth } from "../context/AuthContext";

export default function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const {login}=useAuth();
    const navigate=useNavigate();
    

    const handleLogin=async (e)=>{
        e.preventDefault();

        try {
            const res=await api.post("/auth/login",{
                email,
                password
            });
            login(res.data.token);
            navigate("/");
        } catch (error) {
            alert("Login Failed",error)
            
        }

    };
    return(
        <div className="min-h-screen items-center justify-center">
            <form
            onSubmit={handleLogin}
            className="p-6 border rounded w-80">
           
           <h2 className="text-xl mb-4">
            Login
           </h2>
           <input
           type="email"
           placeholder="Email"
           className="w-full mb-3 p-2 border"
           onChange={(e)=>setEmail(e.target.value)}
           
           />
           <input 
           type="password"
           placeholder="Password"
           className="w-full mb-3 p-2 border"
           onChange={(e)=>setPassword(e.target.value)}
           />
        <button className="w-full bg-blue-500 text-white p-2">
            Login
        </button>
        

            </form>
        </div>
    )


}