import { config } from 'dotenv'
config()

export type Env = {
    PORT: number
}

export const env:Env = {
    PORT: Number(process.env.PORT)
}