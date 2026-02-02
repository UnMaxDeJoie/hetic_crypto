import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';

export async function GET() {
  try {
    await dbConnect();
    const assets = await Asset.find({}).sort({ createdAt: -1 });
    return NextResponse.json(assets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.userId || !body.symbol || !body.quantity) {
      return NextResponse.json(
        { error: 'Champs manquants (userId, symbol, quantity)' },
        { status: 400 }
      );
    }

    const newAsset = await Asset.create(body);
    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}