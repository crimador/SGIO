import { S3 } from '@aws-sdk/client-s3';

const s3Client = process.env.DO_ENDPOINT
  ? new S3({
      endpoint: process.env.DO_ENDPOINT,
      region: process.env.DO_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.DO_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.DO_ACCESS_KEY_SECRET ?? '',
      },
    })
  : null;

export { s3Client };
