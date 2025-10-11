import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routers/user.route.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config({
    path: "./.env",
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));

// API routes
app.use("/api/v1/user", userRouter);


// Error handling middleware - must be last
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});