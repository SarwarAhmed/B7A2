import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {createIssue} from "../controllers/issues.controller";

const router = Router();

router.post('/', authenticate, createIssue);
export default router;
