export interface TelegramEvent {
  message: {
    chat: {
      id: number
      first_name: string
      username: string
      type: string
    },
    text: string
  },
  update_id: number
}
