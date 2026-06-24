import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { MessageModel } from '@/models/Message';

export async function GET() {
  await connectDB();
  const roomIds = await MessageModel.distinct('roomId');
  const rooms = await Promise.all(
    roomIds.map(async (roomId: string) => {
      const messages = await MessageModel.find({ roomId }).sort({ createdAt: 1 }).limit(100);
      return { roomId, messages: messages.map((m: any) => ({ id: m._id, text: m.text, sender: m.sender, time: m.time })) };
    })
  );
  return NextResponse.json(rooms);
}