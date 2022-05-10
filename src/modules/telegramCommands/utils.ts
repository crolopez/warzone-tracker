import { telegramHandler } from '../telegramHandler/telegramHandler'

async function isAdmin(userId: number, chatId: number): Promise<boolean> {
  const chatAdmins = await telegramHandler.getChatAdministrators(chatId)
  return chatAdmins.filter(x => x.id == userId).length > 0
}

export { isAdmin }