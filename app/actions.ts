'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { type Chat } from '@/lib/types'
import CHATS from '@/lib/models/chats.model'
import mongoose from 'mongoose'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    // const pipeline = kv.pipeline()
    // const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
    //   rev: true
    // })

    // for (const chat of chats) {
    //   pipeline.hgetall(chat)
    // }

    // const results = await pipeline.exec()

    const results = await CHATS.find({
      userId: new mongoose.Types.ObjectId(userId)
    })

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  // const chat = await kv.hgetall<Chat>(`chat:${id}`)
  const chat = await CHATS.findById(new mongoose.Types.ObjectId(id))

  if (!chat || (userId && chat.userId.toString() !== userId)) {
    return null
  }

  return chat.toJSON()
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()
  if (!session || !session.user) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  // const uid = String(await kv.hget(`chat:${id}`, 'userId'))
  const chat = await CHATS.findById(new mongoose.Types.ObjectId(id))
  if (!chat) {
    return null
  }

  if (chat.userId.toString() !== session.user.id) {
    return {
      error: 'Unauthorized'
    }
  }

  // await kv.del(`chat:${id}`)
  await CHATS.findByIdAndDelete(new mongoose.Types.ObjectId(id))
  // await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()
  if (!session || !session.user) {
    return {
      error: 'Unauthorized'
    }
  }

  // const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  const chats = await CHATS.find({
    userId: new mongoose.Types.ObjectId(session.user.id)
  })
  if (!chats.length) {
    return redirect('/')
  }
  // const pipeline = kv.pipeline()

  // for (const chat of chats) {
  //   pipeline.del(chat)
  //   pipeline.zrem(`user:chat:${session.user.id}`, chat)
  // }

  // await pipeline.exec()
  await CHATS.deleteMany({
    userId: new mongoose.Types.ObjectId(session.user.id)
  })

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  // const chat = await kv.hgetall<Chat>(`chat:${id}`)
  const chat = await CHATS.findById(new mongoose.Types.ObjectId(id))
  if (!chat) {
    return null
  }

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session || !session.user) {
    return {
      error: 'Unauthorized'
    }
  }

  // const chat = await kv.hgetall<Chat>(`chat:${id}`)
  const chat = await CHATS.findById(new mongoose.Types.ObjectId(id))

  if (!chat || chat.userId.toString() !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  // await kv.hmset(`chat:${chat.id}`, payload)
  await CHATS.findByIdAndUpdate(new mongoose.Types.ObjectId(id), payload)

  return payload
}

export async function saveChat(chat: Chat) {
  const session = await auth()

  if (session && session.user) {
    // const pipeline = kv.pipeline()
    // pipeline.hmset(`chat:${chat.id}`, chat)
    // pipeline.zadd(`user:chat:${chat.userId}`, {
    //   score: Date.now(),
    //   member: `chat:${chat.id}`
    // })
    // await pipeline.exec()

    await CHATS.create(chat)
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = [
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'MONGODB_URI',
    'NODE_ENV'
  ]
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
