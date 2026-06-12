import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {createIssue, getAllIssues} from "../controllers/issues.controller";

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/', getAllIssues)
export default router;
