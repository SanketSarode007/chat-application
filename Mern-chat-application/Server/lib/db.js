
import mongoose from "mongoose";

//Function to connect to mongoDB database

export async function connectDB(){
   try{

    mongoose.connection.on("Connected", () => console.log("Database Connected"))

    await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`)
   }catch(error){
     console.log(error.message)
   }
}