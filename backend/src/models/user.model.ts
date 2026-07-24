import bcrypt from 'bcryptjs'
import mongoose, { Document, ObjectId, Schema } from 'mongoose'
import { comparePassword, hashPassword } from '../utils/bcrypt'

export interface UserDocument extends Document {
    name: string
    email: string
    password?: string
    googleId?: string
    avatar?: string | null
    createdAt: Date
    updatedAt: Date

    comparePassword(pswd: string): Promise<boolean>
} 

const userSchema = new mongoose.Schema<UserDocument>({
    name: {
        type: String,
        required: [true, 'Name is required to create an Identity!'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required to create an account!'],
        unique: [true, 'Account with this email already exists!'],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid Email'],
    },
    password: {
        type: String,
        trim: false,
        minlength: [6, 'Password must be atleast of 6 characters!'],
        select: false,
        required: function() {
            return !this.googleId
        }
    },
    googleId: {
        type: String,
        defualt: null,
        sparse: true
    },
    avatar: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) {
        return
    }
    this.password = await hashPassword(this.password)
    return
})

userSchema.methods.comparePassword = async function (pswd: string) {
    if (!this.password) return false
    return comparePassword(pswd, this.password)
}

const userModel = mongoose.model<UserDocument>('user', userSchema)

export default userModel