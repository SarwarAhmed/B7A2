import type {Request, Response} from 'express';
import {StatusCodes} from "http-status-codes";
import {pool} from "../db/index.db";

export const createIssue =  async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, type } = req.body;
        const reporter_id = req.user!.id;

        if (!title || title.length > 150) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Valid title under 150 characters is required.' });
            return;
        }
        if (!description || description.length < 20) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Description must be at least 20 characters long.' });
            return;
        }
        if (type !== 'bug' && type !== 'feature_request') {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid issue type.' });
            return;
        }

        const result = await pool.query(
            'INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, type, reporter_id]
        );

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Issue created successfully',
            data: result.rows[0],
        });
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
}

// Get All Issues with Filtering, Sorting
export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sort, type, status } = req.query;

        let queryText = 'SELECT * FROM issues WHERE 1=1';
        const queryParams: any[] = [];
        let paramCounter = 1;

        if (type === 'bug' || type === 'feature_request') {
            queryText += ` AND type = $${paramCounter++}`;
            queryParams.push(type);
        }

        if (status === 'open' || status === 'in_progress' || status === 'resolved') {
            queryText += ` AND status = $${paramCounter++}`;
            queryParams.push(status);
        }

        const orderBy = sort === 'oldest' ? 'ASC' : 'DESC';
        queryText += ` ORDER BY created_at ${orderBy}`;

        const issuesResult = await pool.query(queryText, queryParams);
        const issues = issuesResult.rows;

        if (issues.length === 0) {
            res.status(StatusCodes.OK).json({ success: true, message: 'Issues retrieved successfully', data: [] });
            return;
        }

        // Avoid JOINs by pulling reporter data separately via an IN clause batch query
        const userIds = Array.from(new Set(issues.map((i) => i.reporter_id)));
        const usersResult = await pool.query(
            `SELECT id, name, role FROM users WHERE id = ANY($1)`,
            [userIds]
        );

        const userMap = usersResult.rows.reduce((acc: any, user: any) => {
            acc[user.id] = user;
            return   acc;
        }, {});

        const completeData = issues.map((issue) => {
            const { reporter_id, ...issueFields } = issue;
            return {
                ...issueFields,
                reporter: userMap[reporter_id] || null,
            };
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Issues retrieved successfully',
            data: completeData,
        });
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
}

// Get Single Issue
export const singleIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);

        if (issueResult.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Issue not found.' });
            return;
        }

        const issue = issueResult.rows[0];
        const userResult = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [issue.reporter_id]);

        const { reporter_id, ...issueFields } = issue;
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Issue retrieved successfully',
            data: {
                ...issueFields,
                reporter: userResult.rows[0] || null,
            },
        });
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
}

// Update issue
export const updateIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, description, type, status } = req.body;
        const currentUser = req.user!;

        const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
        if (issueResult.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Issue not found.' });
            return;
        }

        const issue = issueResult.rows[0];

        // Access Checking Logic
        if (currentUser.role !== 'maintainer') {
            if (issue.reporter_id !== currentUser.id) {
                res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied. This is not your issue.' });
                return;
            }
            if (issue.status !== 'open') {
                res.status(StatusCodes.CONFLICT).json({ success: false, message: 'Contributors can only modify open issues.' });
                return;
            }
            if (status) {
                res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Only maintainers can shift issue status stages.' });
                return;
            }
        }

        // Apply fields dynamically or fall back to previous records
        const updatedTitle = title !== undefined ? title : issue.title;
        const updatedDesc = description !== undefined ? description : issue.description;
        const updatedType = type !== undefined ? type : issue.type;
        const updatedStatus = status !== undefined ? status : issue.status;

        if (updatedTitle.length > 150 || updatedDesc.length < 20) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Validation mismatch on text fields.' });
            return;
        }

        const updateResult = await pool.query(
            'UPDATE issues SET title = $1, description = $2, type = $3, status = $4 WHERE id = $5 RETURNING *',
            [updatedTitle, updatedDesc, updatedType, updatedStatus, id]
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Issue updated successfully',
            data: updateResult.rows[0],
        });
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
}

// Delete Issue
export const deleteIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (req.user!.role !== 'maintainer') {
            res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Only maintainers can remove entries.' });
            return;
        }

        const checkIssue = await pool.query('SELECT id FROM issues WHERE id = $1', [id]);
        if (checkIssue.rows.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Issue not found.' });
            return;
        }

        await pool.query('DELETE FROM issues WHERE id = $1', [id]);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Issue deleted successfully',
        });
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
}
