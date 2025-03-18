import express from 'express'
import NodeCache from 'node-cache';
import morgan from 'morgan'

//Importing routes

import { errorMiddleware } from './middlewares/error.js';
import newsPaperRoute from "./routes/newspaper.js"


const port = process.env.PORT || 4000

export const nodeCache = new NodeCache()

const app = express()

app.use(express.json());

app.use(morgan("dev"))


app.use("/api/v1" , newsPaperRoute)


app.get('/', (req, res) => {
      res.send("Api working")
})


app.use("/papers", express.static("storage"))

app.use(errorMiddleware)

app.listen(port, () => {
      console.log(`server is working on http://localhost:${port}`)
})