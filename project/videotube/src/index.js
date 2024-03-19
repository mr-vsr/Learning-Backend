import dotenv from "dotenv";
import db from "./db/index.js";
import { app } from "./app.js"

dotenv.config({
    path:"./.env"
})


db()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`⚙️ Server running of port: ${process.env.PORT}`);
        
    })
    })
    .catch((error) => {
        console.log("MONGODB connection failed !!! ",error);
    })







/*
import express from "express"
const app = express()
( async () => {
try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("errror", (error) => {
        console.log("ERRR: ", error);
        throw error
    })

    app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`);
    })

} catch (error) {
    console.error("ERROR: ", error)
    throw err
}
})()

*/