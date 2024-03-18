// const express = require("express"); //This is the common form of importing various libraries in javascript
import express from "express"; //This is the module form of importing various libraries in javascript

//To use module form we have to include type in package.json file and give it the value module

require('dotenv').config();

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World I am on root route");
})

app.get("/login", (req, res) => {
    res.send("<h1>Hello Welcome to the login page</h1>")
})

app.listen(process.env.PORT, () => {
    console.log(`App running on port ${process.env.PORT}`);
})