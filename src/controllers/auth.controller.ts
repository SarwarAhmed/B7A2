import type {Request, Response} from 'express';
import {StatusCodes} from "http-status-codes";
import bcrypt from 'bcrypt';
import {pool} from "../db/index.db";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {name, email, password, role} = req.body;

        if (!name || !email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Name, email, and password are required.'
            });
            return;
        }

        const assignedRole = role || 'contributor';
        if (assignedRole !== 'contributor' && assignedRole !== 'maintainer') {
            res.status(StatusCodes.BAD_REQUEST).json({success: false, message: 'Invalid role assignment.'});
            return;
        }

        // Check unique email duplication
        const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({success: false, message: 'Email already exists.'});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at',
            [name, email, hashedPassword, assignedRole]
        );

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'User registered successfully',
            data: newUser.rows[0],
        });
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({success: false, message: 'Email and password are required.'});
            return;
        }

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            res.status(StatusCodes.BAD_REQUEST).json({success: false, message: 'Invalid credentials.'});
            return;
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(StatusCodes.BAD_REQUEST).json({success: false, message: 'Invalid credentials.'});
            return;
        }

        const token = jwt.sign(
            {id: user.id, name: user.name, role: user.role},
            process.env.JWT_SECRET || 'secret',
            {expiresIn: '1d'}
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                },
            },
        });
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
    }
}
