export enum GameMode  {
  br_brquads = 'BR Quads'
}

const gameModeDic = new Map<string, string>()
gameModeDic.set('br_brquads', 'BR Quads')
gameModeDic.set('br_brtrios', 'BR Trios')
gameModeDic.set('br_brduos', 'BR Duos')
gameModeDic.set('br_rebirth_rbrthquad', 'Resurgence Quads')
gameModeDic.set('br_rebirth_rbrthtrios', 'Resurgence Trios')
gameModeDic.set('br_rebirth_rbrthduos', 'Resurgence Duos')

export { gameModeDic }
