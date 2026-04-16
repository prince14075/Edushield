import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Institute from '@/models/Institute';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode') || '';

    await dbConnect();

    // Query safely: Only APPROVED institutes and conditionally filter by exact pincode matching
    let query: any = { status: 'Approved' };
    
    if (pincode.trim() !== '') {
      query['address.pincode'] = pincode;
    }

    // Protect PII Data
    // We explicitly instruct Mongoose to only select the array of fields below.
    // This ensures passwords, contact numbers, and emails physically never leave the database server.
    const safeInstitutes = await Institute.find(query).select(
      'name address capacity infrastructure facilities safetyCertificates undertakings riskStatus'
    );

    return NextResponse.json({ success: true, data: safeInstitutes });
  } catch (error) {
    console.error('Failed to fetch public institutes:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
