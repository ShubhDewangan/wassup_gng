import mongoose from 'mongoose'
import { Env } from './env.config'

export async function connectDB () {

    console.log('connecting to DB...')

    await mongoose.connect(Env.MONGO_URI)
        .then(() => console.log('Connected to Database!'))
        .catch((error) => {
            console.log('Could not be able to connect to DB...!', error)
            process.exit(1)
        })
}