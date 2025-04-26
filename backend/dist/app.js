import express from 'express';
import morgan from 'morgan';
import cors from "cors";
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
//Importing routes
import { errorMiddleware } from './middlewares/error.js';
import newsPaperRoute from "./routes/newspaper.js";
import magazinesRoute from "./routes/magazines.js";
import paperRoute from "./routes/papers.js";
import userRoute from "./routes/user.js";
import { readRoute } from './middlewares/auth.js';
const port = process.env.PORT || 4000;
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(morgan("dev"));
app.use("/api/v1/news-papers", newsPaperRoute);
app.use("/api/v1/magazines", magazinesRoute);
app.use("/api/v1/papers", paperRoute);
app.use("/api/v1/user", userRoute);
app.get('/', (req, res) => {
    res.send("Api working");
});
app.get("/api/v1/auth/check", (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.json({ authenticated: false });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ authenticated: true, userId: decoded.id });
    }
    catch (err) {
        res.json({ authenticated: false });
    }
});
app.use("/storage", readRoute, express.static(process.env.FOLDER_PATH));
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`server is working on http://localhost:${port}`);
});
