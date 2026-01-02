import express, { NextFunction, Request, Response } from "express";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
const app = express();

// Cors
app.use(
  cors({
    origin: process.env.APP_AUTH_URL || "http://localhost:4000",
    credentials: true,
  })
);

// Json Parser
app.use(express.json());

// Better-auth handler
app.all("/api/auth/*splat", toNodeHandler(auth));

// Post Route
app.use("/post", postRouter);

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

// Handle path errors
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "route not found",
    path: req.path,
  });
});

// Handle JSON parsing errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON payload",
    });
  }
  next(err);
});

export default app;
