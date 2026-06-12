export type UserRole = 'contributor' | 'maintainer';
export type IssueType = 'bug' | 'feature_request';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface JWTPayload {
    id: number;
    name: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
