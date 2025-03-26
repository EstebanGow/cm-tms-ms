import { ITokenDecode } from './ITokenDecode'

export interface ITokenService {
    generarToken(data: object): string
    verificarToken(token: string | undefined): ITokenDecode
}
