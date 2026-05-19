import dotenv from "dotenv"
dotenv.config({quiet:true})

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dbConnection from "./config/database.js"
import authRouter from "./routes/auth-routes.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: "http//localhost:5173",
    credentials:true
}))


const PORT = process.env.PORT || 3000

dbConnection()
 

app.use('/v1/api',authRouter)



app.listen(PORT, (err) => {
   
    console.log("Server running at port");
    
})


