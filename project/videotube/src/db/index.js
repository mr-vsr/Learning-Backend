import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const db = async () => {
    try {

        const databaseInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(databaseInstance.connection.host);

    } catch (error) {
        console.log("Database Function Error: ", error);
        process.exit(1);
    }
}

export default db;