import userModel from "../models/user.model"

export const findByIdUserService = async ( userId: string ) => {
    return await userModel.findById(userId)
}

export const getUsersService = async ( userId: string ) => {
    return await userModel.find(
        { _id: { $ne: userId } }
    )
}

export const getSingleUserService = async ( otherUserId: string ) => {
    return await userModel.findById(otherUserId)
}