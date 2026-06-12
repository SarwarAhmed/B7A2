import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {
    createIssue,
    deleteIssue,
    getAllIssues,
    singleIssue,
    updateIssue
} from "../controllers/issues.controller";

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/', getAllIssues)
router.get('/:id', singleIssue)
router.patch('/:id', authenticate, updateIssue)
router.delete('/:id', authenticate, deleteIssue)
export default router;
