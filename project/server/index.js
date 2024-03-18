import express from "express";
import dotenv from "dotenv"

dotenv.config();

const app = express();
const joke = [{
    id: "1",
    title: "Joke 1",
    content:"It's a joke A"
},
    {
    id: "1",
    title: "Joke 1",
    content: "It's a joke A"
    },
    {
    id: "1",
    title: "Joke 1",
    content: "It's a joke A"
    },
    {
    id: "1",
    title: "Joke 1",
    content: "It's a joke A"
    },
    {
    id: "1",
    title: "Joke 1",
    content: "It's a joke A"
}]

app.get("/api/jokes", (req, res) => {
    res.json(joke);
})

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})