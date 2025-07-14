import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

interface QueryType {
  $or?: Array<{
    "hs_코드"?: { $gte: number; $lte: number };
    "cn_검증용"?: { $gte: number; $lte: number };
  }>;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hs = searchParams.get("hs") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const PAGE_SIZE = 5;

  const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const col = db.collection("HSCODE");

    // HS 코드 검색 로직 수정
    let query: QueryType = {};
  if (hs) {
    const hsNumber = parseInt(hs, 10);
    if (!isNaN(hsNumber)) {
     const minHs = hsNumber * Math.pow(10, 6 - hs.length);
      const maxHs = minHs + Math.pow(10, 6 - hs.length) - 1;
     query = {
        $or: [
          { "hs_코드": { $gte: minHs, $lte: maxHs } },
         { "cn_검증용": { $gte: minHs, $lte: maxHs } }
        ]
    };
    }
  }

    // 정렬 추가 (HS 코드 기준 오름차순)
    const total = await col.countDocuments(query);
    const docs = await col
    .find(query)
    .sort({ "hs_코드": 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray();

    return NextResponse.json({ 
      results: docs, 
      total, 
      page, 
      pageSize: PAGE_SIZE,
      query: query.$or?.[0] // 디버깅용
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "데이터베이스 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 