import aws from "aws-sdk"

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
})

const uploadToS3 = async (arrayBuffer, key, mimeType) => {
    const buffer = Buffer.from(arrayBuffer)

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
    }

    try {
        const uploadResult = await s3.upload(params).promise()
        return uploadResult.Location
    }
    catch (error) {
        console.error("Error uploading to S3:", error)
        throw new Error("Failed to upload file to S3")
    }
}

export default uploadToS3