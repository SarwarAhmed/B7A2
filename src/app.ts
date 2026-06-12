import express, {type Application, type NextFunction, type Request, type Response} from "express";
import config from "./config";
import {StatusCodes} from "http-status-codes";
import authRoutes from "./routes/auth.routes";
import issuesRoutes from "./routes/issues.routes";

const app: Application = express();
const PORT = config.port || 5000;
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send(`Server is running on port ${PORT}`);
})

// Main App API
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

// Not Found Middleware
app.use((req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Requested API endpoint route does not exist.',
    });
});

// Generic Error Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'An unexpected exception layer server bug occurred.',
        errors: err.message,
    });
});

export default app
