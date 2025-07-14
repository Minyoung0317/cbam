import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const COLLECTION = 'precursor';
const DEMO_USER_ID = 'demo'; // 추후 로그인 연동 시 수정

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: '전구물질 목록이 필요합니다.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'ESG');
    const docs = body.map((precursor: any) => ({
      userId: DEMO_USER_ID,
      name: precursor.name,
      nameEn: precursor.nameEn || "",
      productionRoutes: precursor.productionRoutes,
      finalCountryCode: precursor.finalCountryCode,
      createdAt: new Date(),
    }));
    const result = await db.collection(COLLECTION).insertMany(docs);
    return NextResponse.json({ insertedCount: result.insertedCount }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 });
  }
} 