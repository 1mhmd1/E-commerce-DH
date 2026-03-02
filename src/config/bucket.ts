
const B2_ENDPOINT = process.env.B2_ENDPOINT as string;
const B2_ACCESS_KEY_ID = process.env.B2_ACCESS_KEY_ID as string;
const B2_SECRET_ACCESS_KEY = process.env.B2_SECRET_ACCESS_KEY as string;
const B2_REGION = process.env.B2_REGION as string;


import { S3Client } from "@aws-sdk/client-s3";


// Create a reusable S3 client configured to talk to Backblaze B2
// Backblaze B2 is S3-compatible, so we just point the endpoint to B2 instead of AWS
const b2Client = new S3Client({
    region: B2_REGION,
    endpoint: B2_ENDPOINT,
    credentials: {
        accessKeyId: B2_ACCESS_KEY_ID,
        secretAccessKey: B2_SECRET_ACCESS_KEY
    },
    forcePathStyle: true// Required for B2: uses path-style URLs like endpoint/bucket/key
    // instead of bucket.endpoint/key (which is AWS default)
});

export default b2Client;

