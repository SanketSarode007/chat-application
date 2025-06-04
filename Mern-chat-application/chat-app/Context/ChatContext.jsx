
import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({children}) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext);

    //* Function to get all users from sidebar
    async function getUser(){
        try {
           const {data} =  await axios.get('/api/messages/users');
           if(data.success){
            setUsers(data.users);
            setUnseenMessages(data.unseenMessages);
           }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //* Function to get messages for selected users
    async function getMessages(userId){
        try {
          const {data} =  await axios.get(`/api/messages/${userId}`)
          if(data.success){
            setMessages(data.messages)
           }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //* Function to send messages for selected users
    async function sendMessage(messageData){
        try {
          const {data} =  await axios.get(`/api/messages/send/${selectedUser._id}`, messageData);
          if(data.success){
            setMessages((prevMessages) => [...prevMessages, data.newMessage ])
           }else{
            toast.error(error.message);
           }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //* Function to subscribe to messages for selected users
    async function subscribeToMessages(messageData){
        try {
          if(!socket) return;
          socket.on("newMessage", (newMessage) => {
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }else{
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages, 
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ?
                    prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
          })
        } catch (error) {
            toast.error(error.message);
        }
    }

    //* Function to unsubscribe from messages 
    async function unsubscribeToMessages(messageData){
        if(socket) socket.off("newMessage");  
    }

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeToMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        getUser,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    }

    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}