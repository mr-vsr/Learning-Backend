import { useEffect, useState } from 'react'
import './App.css';
import axios from "axios";

function App() {
  const [jokes, setJokes] = useState([]);
  useEffect(() => {
    axios.get("/api/jokes")
      .then((response) => setJokes(response.data))
      .catch((error) => {
      console.log(error)
    })
  },[])

  return (
    <>
      <div>
        <h1>JOKES</h1>
        <h3>{jokes.length}</h3>
        {jokes.map((joke,index) => (
          <div key={index}>
          <h1>{joke.title}</h1>
          <p>{joke.content}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
