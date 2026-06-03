import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

// ============================================================================
// 1. AWS S3 CLIENT INITIALIZATION
// ============================================================================
// Fallback initialization allows local compilation without throwing hard infrastructure crashes
const s3Client = new S3Client({
  region: environment.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: environment.AWS_ACCESS_KEY_ID || 'mock_aws_access_key',
    secretAccessKey: environment.AWS_SECRET_ACCESS_KEY || 'mock_aws_secret_key',
  },
});

if (!environment.AWS_ACCESS_KEY_ID || !environment.AWS_SECRET_ACCESS_KEY) {
  logger.warn('AWS S3 Credentials missing from environment configuration. File storage buckets will run in simulation mode.');
} else {
  logger.info(`AWS S3 Service Layer actively linked to storage target bucket: [${environment.AWS_S3_BUCKET_NAME}]`);
}

// ============================================================================
// 2. CORE STORAGE SERVICE INTERFACES
// ============================================================================

/**
 * Generates an upload presigned URL allowing the Next.js frontend to stream file data
 * directly to Amazon S3, bypassing Node computing memory boundaries completely.
 * @param fileKey The designated unique file destination path string (e.g. 'avatars/user_123/video.mp4')
 * @param contentType The MIME file signature type constraints (e.g. 'video/mp4')
 * @param expiresInSeconds Duration limits before link signature expires (defaults to 15 minutes)
 */
export const getUploadPresignedUrl = async (
  fileKey: string,
  contentType: string,
  expiresInSeconds: number = 900
): Promise<string> => {
  const bucketName = environment.AWS_S3_BUCKET_NAME || 'mirror-me-mock-bucket';

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    // Generate secure time-bounded authorization signature
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return uploadUrl;
  } catch (error: any) {
    logger.error(`Presigned URL Generation Exception for Storage Key [${fileKey}]:`, error.message);
    throw new Error('Failed to generate cloud workspace asset upload signature portal.');
  }
};

/**
 * Generates a read presigned URL allowing time-locked secure media content streaming
 * for assets stored inside private S3 cloud containers.
 * @param fileKey The asset path identifier key to read from storage
 * @param expiresInSeconds Access window lifecycle duration before link signature expires (defaults to 1 hour)
 */
export const getDownloadPresignedUrl = async (
  fileKey: string,
  expiresInSeconds: number = 3600
): Promise<string> => {
  const bucketName = environment.AWS_S3_BUCKET_NAME || 'mirror-me-mock-bucket';

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return downloadUrl;
  } catch (error: any) {
    logger.error(`Download Link Generation Exception for Storage Key [${fileKey}]:`, error.message);
    throw new Error('Failed to compile resource retrieval streaming authorization.');
  }
};
