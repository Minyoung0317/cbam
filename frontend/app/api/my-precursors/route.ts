import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'precursor';
const DEMO_USER_ID = 'demo'; // 추후 로그인 연동 시 수정

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'ESG');
    const precursors = await db
      .collection(COLLECTION)
      .find({ userId: DEMO_USER_ID })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(precursors, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'DB 조회 오류' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: '전구물질 목록이 필요합니다.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'ESG');
    const matCol = db.collection('material');
    // name으로 material에서 cn코드 정보 찾아 매핑
    const docs = await Promise.all(body.map(async (precursor: any) => {
      let cnCode = precursor.cnCode ?? "";
      let cnCode1 = precursor.cnCode1 ?? "";
      let cnCode2 = precursor.cnCode2 ?? "";
      if ((!cnCode || !cnCode1 || !cnCode2) && precursor.name) {
        const mat = await matCol.findOne({ "품목": precursor.name });
        if (mat) {
          cnCode = cnCode || mat["cn코드"] || "";
          cnCode1 = cnCode1 || mat["cn코드.1"] || "";
          cnCode2 = cnCode2 || mat["cn코드.2"] || "";
        }
      }
      return {
        userId: DEMO_USER_ID,
        name: precursor.name,
        nameEn: precursor.nameEn || "",
        cnCode,
        cnCode1,
        cnCode2,
        productionRoutes: precursor.productionRoutes,
        finalCountryCode: precursor.finalCountryCode,
        createdAt: new Date(),
      };
    }));
    const result = await db.collection(COLLECTION).insertMany(docs);
    return NextResponse.json({ insertedCount: result.insertedCount }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'ESG');
    const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id), userId: DEMO_USER_ID });
    if (result.deletedCount === 1) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: '삭제 실패' }, { status: 404 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'DB 삭제 오류' }, { status: 500 });
  }
} 