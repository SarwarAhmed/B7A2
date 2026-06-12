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
