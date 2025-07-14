import { NextRequest, NextResponse } from "next/server";
import { MongoClient, WithId, Document } from "mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);
  const matCol = db.collection("HSCODE"); // HSCODE 컬렉션만 조회

  const query = search
    ? { "품목_(cn기준)": { $regex: search, $options: "i" } }
    : {};
  const listFromDb = await matCol.find(query).toArray();

  await client.close();

  const mappedList = listFromDb.map((item: WithId<Document>) => {
    return {
      HS_코드: item["hs_코드"],
      품목: item["품목_(cn기준)"],
      품목영문: item["품목_(cn기준_영문)"],
      직접: item["직접"],
      간접: item["간접"],
    
    };
  });

  return NextResponse.json({ materials: mappedList });
} 