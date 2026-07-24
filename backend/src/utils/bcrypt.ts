import bcrypt from 'bcryptjs'

export const hashPassword = async (pswd: string, salt: number = 10) => {
    return await bcrypt.hash(pswd, salt)
}
export const comparePassword = async (pswd: string, hashedPswd: string) => {
    return await bcrypt.compare(pswd, hashedPswd)
}