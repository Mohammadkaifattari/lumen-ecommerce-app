import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { MessageModel } from '@/models/Message';
import { pusherServer } from '@/lib/pusher';

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
await pusherServer.trigger(`chat-${params.roomId}`, 'chat-message', {
    roomId: params.roomId,
    message: { id: msg._id, text: msg.text, sender: msg.sender, time: msg.time },
  });
  await pusherServer.trigger('admin-channel', 'chat-message', {
    roomId: params.roomId,
    message: { id: msg._id, text: msg.text, sender: msg.sender, time: msg.time },
  });
  return NextResponse.json(msg);
}