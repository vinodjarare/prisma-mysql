import express from "express";
import { errorMiddleware } from "async-express-error-handler";
import userRoute from "./routes/userRoute";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 4000;

app.use("/api", userRoute);

app.use(errorMiddleware);
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
