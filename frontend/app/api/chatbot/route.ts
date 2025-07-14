import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  // FastAPI 서버로 POST 요청
  const fastapiRes = await fetch("http://localhost:8000/generate/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await fastapiRes.json();
  return NextResponse.json({ result: data.result });
}
