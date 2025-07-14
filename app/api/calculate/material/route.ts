import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(req: NextRequest) {
  const { material_name, material_amount } = await req.json();

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);

  const matCol = db.collection("material");

  // 🔵 정규식 문자열 제대로 감싸기 (백틱 사용!)
  const matDoc = await matCol.findOne({ 품목: { $regex: `^${material_name}$`, $options: "i" } });

  if (!matDoc || matDoc["직접"] === undefined) {
    await client.close();
    return NextResponse.json({ error: "해당 원료명을 찾을 수 없거나 직접배출계수가 없습니다." }, { status: 404 });
  }

  const emissionFactor = parseFloat(matDoc["직접"]);
  const emission = material_amount * emissionFactor * 1.0;

  await client.close();
  return NextResponse.json({ emission: Number(emission.toFixed(6)) });
}
