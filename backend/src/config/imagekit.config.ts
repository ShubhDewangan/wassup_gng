import ImageKit from "imagekit"; // Use exact package import
import { InternalServerException } from "../utils/app-error";

const client = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export async function uploadImage(imageBuffer: Buffer, chatId: string): Promise<string> {
    try {
        const result = await client.upload({
            file: imageBuffer.toString('base64'),
            fileName: `chat_media_${Date.now()}.jpg`,
            folder: `chatty/chats/${chatId}/images` // Dynamically scopes folders by chatId
        });
        return result.url; // Returns the public image URL
    } catch (error) {
        console.error('ImageKit Upload Failed: ', error);
        throw new InternalServerException('Something went wrong, cannot upload this file.');
    }
}
