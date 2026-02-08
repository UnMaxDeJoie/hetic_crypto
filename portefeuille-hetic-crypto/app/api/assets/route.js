import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';

const verifyToken = (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.error("❌ Pas de header Authorization reçu");
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        console.error("❌ Header présent mais token vide");
        return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;

  } catch (error) {
    console.error("❌ Erreur de vérification du token :", error.message);
    return null;
  }
};

export async function GET(request) {
  await dbConnect();
  
  const userId = verifyToken(request);
  
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const assets = await Asset.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(assets);
}

export async function POST(request) {
  try {
    await dbConnect();
    const userId = verifyToken(request);

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.symbol || !body.quantity) {
      return NextResponse.json({ error: "Symbole et quantité requis" }, { status: 400 });
    }

    const newAsset = await Asset.create({
      userId: userId,
      symbol: body.symbol,
      quantity: body.quantity
    });
    
    return NextResponse.json(newAsset, { status: 201 });

  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}