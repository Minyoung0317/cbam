import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// 한글 특수문자 포함 검색을 위해 정규표현식 이스케이프
function escapeRegex(text: string) {
  // 정규식 특수문자 처리
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);
  const fuelCol = db.collection("Fuel");

  // 필드명: DB 실제 컬럼이 "연료_유형_설명" 인지 확인(언더바 버전으로!).
  const query = search
    ? { "연료_유형_설명": { $regex: escapeRegex(search.trim()), $options: "i" } }
    : {};

  const fuels = await fuelCol.find(query).limit(50).toArray();

  await client.close();

  // 변환: undefined/null → 0 으로 변환, NaN 방지
  return NextResponse.json({
    fuels: fuels.map(fuel => ({
      연료명: fuel["연료_유형_설명"] || "",
      연료명En: fuel["연료_유형_설명_영어"] || "",
      배출계수: Number(fuel["배출계수\n(tco₂/tj)"]) || 0,
      순발열량: Number(fuel["순발열량\n(tj/gg)"]) || 0
    }))
  });
}
