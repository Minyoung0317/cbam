import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { filename, pdfBase64 } = await req.json();

    if (!filename || !pdfBase64) {
      return NextResponse.json({ message: 'filename, pdfBase64 필요' }, { status: 400 });
    }

    // public/reports 폴더 만들기 (없으면)
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, filename);
    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });

    // 리턴: public 접근 가능한 URL
    return NextResponse.json({ url: `/reports/${filename}` });
  } catch (e) {
    return NextResponse.json({ message: '파일 저장 실패', error: String(e) }, { status: 500 });
  }
}
