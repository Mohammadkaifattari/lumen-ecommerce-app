import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { MessageModel } from '@/models/Message';

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
await connectDB();
const messages = await MessageModel.find({ roomId: params.roomId }).sort({ createdAt: 1 }).limit(100);
return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
await connectDB();
const body = await req.json();
const msg = await MessageModel.create({
roomId: params.roomId,
text: body.text,
sender: body.sender,
time: body.time,
});
return NextResponse.json(msg);
}