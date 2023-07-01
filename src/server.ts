import { taskRouter } from "./routes/task.routes";
import { userRouter } from "./routes/user.routes";
import { config } from "dotenv";

config();

const express = require('express');

const app = express();

app.use(express.json());

app.use('/user',userRouter);
app.use('/task',taskRouter);


app.listen(4000); 