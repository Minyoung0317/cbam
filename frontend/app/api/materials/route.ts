import { NextRequest, NextResponse } from "next/server";
import { MongoClient, WithId, Document } from "mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);
  const matCol = db.collection("Raw");

  // 반드시 언더바 버전의 필드 사용!
  const query = search
    ? { "투입물_혹은_산출물": { $regex: search, $options: "i" } }
    : {};

  const listFromDb = await matCol.find(query).limit(50).toArray();
  await client.close();

  const mappedList = listFromDb.map((item: WithId<Document>) => ({
    품목: item["투입물_혹은_산출물"] || "",
    품목En: item["투입물_혹은_산출물_영어"] || "",
    직접: item["배출_계수_(t_co₂/t)_)"] ?? null,
    cn코드: item["cn코드"] ?? "",
    cn코드1: item["cn코드1"] ?? "",
    cn코드2: item["cn코드2"] ?? "",
  }));

  return NextResponse.json({ materials: mappedList });
}