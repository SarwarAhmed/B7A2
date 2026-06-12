import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {createIssue, getAllIssues, singleIssue} from "../controllers/issues.controller";

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/', getAllIssues)
router.get('/:id', singleIssue)
export default router;
