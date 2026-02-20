// receives the request from the server and interacts with frontend and database!!

import express from 'express';

const app = express();

// routes import
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';


// routes declaration
app.use("app/v1/users",userRouter);
app.use("app/v1/users",postRouter);

// example route  : https://localhost:4000/api/v1/users/register

export default app;