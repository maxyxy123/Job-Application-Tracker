import {z} from 'zod'

export const EnvSchema = z.object({
    DATABASE_URL :z.string().min(1,"ERROR IN DATABASE_URL"),
    ACCESS_TOKEN_SECRET : z.string().min(1,"ACCESS_TOKEN_SECRET IS EMPTY"),
    REFRESH_TOKEN_SECRET : z.string().min(1,"REFRESH_TOKEN_SECRET IS EMPTY"),
    PORT : z.coerce.number(),
    REFRESH_TOKEN_TTL : z.string().nonempty(),
    ACCESS_TOKEN_TTL : z.string().nonempty()
})