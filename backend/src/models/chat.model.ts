import mongoose, { Document, Schema } from 'mongoose'

export interface ChatDocument extends Document {
    participants: mongoose.Types.ObjectId[]
    lastMessage: mongoose.Types.ObjectId
    isGroup: boolean
    groupName: string
    createdBy: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const chatSchema = new mongoose.Schema<ChatDocument>({
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
    ],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    isGroup: {
        type: Boolean,
        default: false,
    },
    groupName: {
        type: String,
        default: `Group ${Date.now()}`
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
})

const ChatModel = mongoose.model<ChatDocument>('Chat', chatSchema)

export default ChatModel