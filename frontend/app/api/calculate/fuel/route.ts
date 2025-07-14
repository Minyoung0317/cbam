import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { fuel_name, fuel_amount } = await req.json();
    if (!fuel_name || fuel_amount == null) {
      return NextResponse.json({ error: "fuel_name과 fuel_amount를 모두 입력하세요." }, { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const fuelCol = db.collection("Fuel");

    // 필드명 매핑: "연료_유형_설명" (혹시 DB가 "연료 유형 설명"으로 띄어쓰기라면 여기도 맞춰주세요!)
    const fuelDoc = await fuelCol.findOne({
      "연료_유형_설명": { $regex: `^${fuel_name.trim()}$`, $options: "i" }
    });

    if (!fuelDoc) {
      await client.close();
      return NextResponse.json({ error: "해당 연료명을 찾을 수 없습니다." }, { status: 404 });
    }

    // 실제 DB의 필드명을 정확히 맞춰주세요!
    const emissionFactor = parseFloat(fuelDoc["배출계수\n(tco₂/tj)"]);
    const netCalorificValue = parseFloat(fuelDoc["순발열량\n(tj/gg)"]);

    if (isNaN(emissionFactor) || isNaN(netCalorificValue)) {
      await client.close();
      return NextResponse.json({ error: "DB에 배출계수 또는 순발열량 값이 올바르지 않습니다." }, { status: 500 });
    }

    // 배출량 계산
    // 연료량(톤) * 순발열량(TJ/Gg) * 배출계수(tCO2/TJ) * 1e-3 (Gg→톤)
    const emission = fuel_amount * netCalorificValue * emissionFactor * 1e-3;

    await client.close();
    return NextResponse.json({
      emission: Number(emission.toFixed(6)),
      fuel_name: fuelDoc["연료_유형_설명"],
      emissionFactor,
      netCalorificValue
    });
  } catch (error) {
    return NextResponse.json({ error: "서버 오류가 발생했습니다.", details: String(error) }, { status: 500 });
  }
}
