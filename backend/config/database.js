import mongoose from "mongoose";


async function dbConnection() {
    try {
        
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("database connect");
        

    } catch (error) {
        console.log(error);
        
        console.log("not connect");
        
    }
}


export default dbConnection