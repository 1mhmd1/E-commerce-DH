import express from "express";
import authRouter from "./routes/auth.routes";
import userSkillsRouter from "./routes/user.skills.routes";
import { StudentProfileRouter, InstructorProfileRouter } from "./routes/user.profile.router";
import errorHandler from "./middlewares/error.middleware";



const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.use('/skills', userSkillsRouter);
app.use('/profile', StudentProfileRouter);
app.use('/instuctor/profile', InstructorProfileRouter)

app.use(errorHandler);

export default app;
