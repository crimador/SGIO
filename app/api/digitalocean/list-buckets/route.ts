import { NextResponse } from 'next/server';
import { s3Client } from '@/lib/digital-ocean-s3';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!s3Client) {
    return NextResponse.json({ error: 'S3 storage not configured' }, { status: 503 });
  }

  const buckets = await s3Client.send(new ListBucketsCommand({}));

  return NextResponse.json({ buckets, success: true }, { status: 200 });
}
