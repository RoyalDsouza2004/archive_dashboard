import express from 'express'
import morgan from 'morgan';
import cors from "cors"

//Importing routes

import { errorMiddleware } from './middlewares/error.js';
import newsPaperRoute from "./routes/newspaper.js"
import magazinesRoute from "./routes/magazines.js"
import paperRoute from "./routes/papers.js"
import userRoute from "./routes/user.js"
import { readRoute } from './middlewares/auth.js';


const port = process.env.PORT || 4000


const app = express()

app.use(express.json());


app.use(
      cors({
            origin: [ 'http://localhost:3000'],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials:true
      })
);

app.use(morgan("dev"))


app.use("/api/v1/news-papers" , newsPaperRoute)
app.use("/api/v1/magazines" , magazinesRoute)
app.use("/api/v1/papers" , paperRoute)
app.use("/api/v1/user" , userRoute)


app.get('/', (req, res) => {
      res.send("Api working")
})


app.use("/papers" ,readRoute, express.static(process.env.FOLDER_PATH as string))

app.use(errorMiddleware)

app.listen(port, () => {
      console.log(`server is working on http://localhost:${port}`)
})