import express from "express";
import { errorHanlder } from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.route.js";
import courseRouter from "./routes/course.route.js";
import instructorManagementRouter from "./routes/instructorManagement.route.js";
import { requestLogger } from "./middlewares/loggerMiddleWare.js";

import moduleRouter from "./routes/module.route.js";
import lessonRouter from "./routes/lesson.route.js";
import cohortRouter from "./routes/cohort.route.js";
import paymentRouter from "./routes/payment.route.js";
import enrollmentRouter from "./routes/enrollment.route.js";
import quizRouter from "./routes/quiz.route.js";
import announcementRouter from "./routes/announcement.route.js"
import feedRouter from "./routes/feed.route.js"
import workShopRouter from "./routes/workshop.route.js"
import messageRouter from "./routes/message.route.js"
import roomRouter from "./routes/room.route.js"
import cors from "cors"
import { setupSwagger } from "./docs/index.js"
const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(cors({
    origin:[
        "https://ayonaire.com",
        "http://localhost:3000"
    ]
}))

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/instructor-management", instructorManagementRouter);
app.use("/api/v1/module", moduleRouter);
app.use("/api/v1/lesson", lessonRouter);
app.use("/api/v1/cohort", cohortRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/enrollment", enrollmentRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/announcement", announcementRouter)
app.use("/api/v1/feed", feedRouter)
app.use("/api/v1/workshop", workShopRouter)
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/room", roomRouter)

// Serve Swagger static folder (Vercel-friendly)


// Optional: redirect root to docs
app.get("/", (req, res) => res.redirect("/api-docs"));

app.use(errorHanlder); 
setupSwagger(app);


export default app;