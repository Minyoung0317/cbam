import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb'; // 경로 수정 (app 디렉토리 기준)
import { ObjectId } from 'mongodb';

// PrecursorSearchModal에서 사용할 데이터 형식 (API 응답의 배열 요소 타입)
interface ApiPrecursorData {
  _id: string;
  name: string;
  directFactor: number;
  indirectFactor: number;
  cnCode: string;
}

// MongoDB의 material 컬렉션 문서 스키마 (실제 DB 스키마 반영)
interface MaterialDocument {
  _id: ObjectId;
  품목군_1?: string;
  품목군?: string;
  cn코드: number | string;
  'cn코드.1'?: string;
  'cn코드.2'?: string;
  품목: string;
  직접: number; // 전구물질의 직접 배출 계수
  간접: number; // 전구물질의 간접 배출 계수
  합?: number;
}

export async function GET(req: NextRequest) {
  // 캐시 제어 헤더 설정
  const responseHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const { searchParams } = new URL(req.url); // App Router에서는 req.url이 항상 존재
    const search = searchParams.get("search") || "";

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "ESG");
    const materialCol = db.collection<MaterialDocument>("material");

    const query: any = {};
    if (search) {
      query['$or'] = [
        { "품목": { $regex: search, $options: "i" } },
        // cn코드가 문자열 타입 필드에 저장되어 있다고 가정하고 검색
        // 만약 cn코드가 숫자 타입이라면, $regex는 적합하지 않음. 숫자 직접 비교 필요.
        { "cn코드": { $regex: String(search), $options: "i" } } 
      ];
    }

    const materials = await materialCol.find(query).limit(50).toArray(); // 연료 API처럼 50개 제한 추가

    const precursorsTransformed: ApiPrecursorData[] = materials.map(material => ({
      _id: material._id.toString(),
      name: material.품목,
      directFactor: material.직접,
      indirectFactor: material.간접,
      cnCode: String(material.cn코드)
    }));
    
    // PrecursorSearchModal이 { precursors: [...] } 형태 또는 배열 [...] 형태를 기대함
    // 연료 API가 { fuels: [...] } 형태이므로 일관성을 위해 { precursors: [...] } 사용
    return NextResponse.json({ precursors: precursorsTransformed }, { status: 200, headers: responseHeaders });

  } catch (error) {
    console.error("Error fetching precursors (API):", error);
    let errorMessage = "데이터를 가져오는 중 오류가 발생했습니다.";
    // error가 Error 인스턴스인지 확인하여 좀 더 구체적인 메시지 제공 가능
    if (error instanceof Error) {
      // errorMessage = error.message; // 실제 에러 메시지를 노출할지는 보안상 고려 필요
    }
    return NextResponse.json({ message: `API Error: ${errorMessage}` }, { status: 500, headers: responseHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "ESG");
    const precursorCol = db.collection("precursors"); // 컬렉션 이름을 precursors로 변경

    const precursors = await req.json();

    // 'No'를 제외한 데이터만 저장
    const materialsToInsert = precursors.map((precursor: any) => ({
      name: precursor.name,
      productionRoute: precursor.productionRoute,
      finalCountryCode: precursor.finalCountryCode,
    }));

    // MongoDB에 데이터 삽입
    await precursorCol.insertMany(materialsToInsert);

    return NextResponse.json({ message: "모든 전구물질이 성공적으로 저장되었습니다." }, { status: 200 });
  } catch (error) {
    console.error("Error saving precursors (API):", error);
    return NextResponse.json({ message: "전구물질 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
} 