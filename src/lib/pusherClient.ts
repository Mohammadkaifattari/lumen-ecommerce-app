import PusherJs from 'pusher-js';

export const pusherClient = typeof window !== 'undefined'
  ? new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  : (null as any);