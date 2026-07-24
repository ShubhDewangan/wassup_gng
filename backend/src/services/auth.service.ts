import userModel, { UserDocument } from "../models/user.model";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/app-error";
import { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator";

interface GoogleUserPayload {
    googleId: string
    email: string
    name: string
    avatar?: string | null
}

export const registerService = async (body: RegisterSchemaType) => {
    const existingUser = await userModel.findOne({ email: body.email })
    if (existingUser) throw new UnauthorizedException("User already exists")
    const user = new userModel({
        ...body,
    })
    await user.save()
    return user
}

export const loginService = async (body: LoginSchemaType) => {
    const user = await userModel.findOne({ email: body.email }).select('+password')
    if (!user) throw new NotFoundException('User not found')

    if (!user.password) {
        throw new BadRequestException('Please use Google Sign-In to log into this account.')
    }

    const isPasswordValid = await user.comparePassword(body?.password as string)

    if (!isPasswordValid) throw new UnauthorizedException('Invalid combination')

    return user 
}

export const findOrCreateUserService = async (payload: GoogleUserPayload) => {
    let user = (await userModel.findOne({ googleId: payload.googleId })) as UserDocument | null;
    if (user) {
        if (payload.avatar && user.avatar !== payload.avatar) {
            user.avatar = payload.avatar
            await user.save()
        }
        return user
    };

    user = (await userModel.findOne({ email: payload.email })) as UserDocument | null;
    if (user) {
        user.googleId = payload.googleId;
        if (!user.avatar) user.avatar = payload.avatar
        await user.save();
        return user;
    }

    user = new userModel({
        name: payload.name,
        email: payload.email,
        googleId: payload.googleId,
        avatar: payload.avatar
    });
    
    await user.save();
    return user;
};
