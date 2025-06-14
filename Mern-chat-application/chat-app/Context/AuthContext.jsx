import { createContext } from "react";
import axios from "axios";
import { useState } from "react";
import {toast} from "react-hot-toast";
import { useEffect } from "react";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [token, setToken] = useState(localStorage.getItem("token"))

    const [authUser, setAuthUser] = useState(null)
    const [onlineUser, setOnlineUser] = useState([])
    const [socket, setSocket] = useState(null)

    //* Check if the user is authenticated and if so, set the user data and connect the socket

    async function checkAuth() {
        try {
          const {data} =  await axios.get('/api/auth/check');
          if(data.success){
            setAuthUser(data.user)
            connectSocket(data.user)
          }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Login function to handle user Authentication and socket connection
    async function login(state, credentials){
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common['token'] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //Logout function to handle user logout and socket disconntion
    async function logout() {
        localStorage.removeItem('token');
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        axios.defaults.headers.common['token'] = null;
        toast.success("Logged out successfully")
        socket.disconnect();
    }

    //Update profile function to handle user profile updates
    async function updateProfile(body){
        try {
            //console.log(body)
            const {data} = await axios.put('/api/auth/update-profile', body);
            //console.log(data);
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Connect Socket function to handle the socket connection and online users updates
    const connectSocket = (userData) => {
        //console.log(userData)
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        
        newSocket.connect();
        console.log(newSocket)
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            console.log(userIds)
            setOnlineUser(userIds);
        })
    }

    useEffect(() => {
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    }, [])

    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}