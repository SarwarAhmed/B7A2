import type {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {StatusCodes} from 'http-status-codes';
import type {JWTPayload, UserRole} from "../types";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Access denied. Missing token.',
        });
        return;
    }

    try {
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET || 'secret') as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};

export const authorize = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Forbidden. Insufficient permissions.',
            });
            return;
        }
        next();
    };
};
