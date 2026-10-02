
import type { AuthUserType } from "../module/auth/types/auth-user.types.js"
declare global {
    namespace Express {
        interface Request {
            user : AuthUserType 
        }
    }
}

export {}