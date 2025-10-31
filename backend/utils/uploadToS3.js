import aws from "aws-sdk"
import { v4 as uuidv4 } from "uuid"

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
})

const uploadToS3 = async (buffer, folder, mimeType) => {
    const key = `${folder}/${uuidv4()}`

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
    }

    const uploadResult = await s3.upload(params).promise()
    return uploadResult.Location
}

export default uploadToS3