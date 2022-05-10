export interface TelegramEvent {
  message: {
    chat: {
      id: number
      type: string
    },
    from: {
      id: number
      first_name: string
      username: string
    }
    text: string
  },
  update_id: number
}
