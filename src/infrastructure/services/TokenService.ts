import jwt from 'jsonwebtoken'
import { ITokenService } from '@common/interfaces/ITokenService'
import ENV from '@common/envs/Envs'
import ExpiracionToken from '@common/enum/ExpiracionToken'
import CustomError from '@common/util/CustomError'
import { ITokenDecode } from '@common/interfaces/ITokenDecode'

export class TokenService implements ITokenService {
    private jwtSecret = ENV.JWT_SECRET

    private readonly NO_TOKEN_ERROR = 'No authorization token provided'

    private readonly INVALID_TOKEN_FORMAT_ERROR = 'Invalid token format'

    private readonly TOKEN_EXPIRED_ERROR = 'Token expired'

    private readonly INVALID_TOKEN_ERROR = 'Invalid token'

    generarToken(data: object): string {
        return jwt.sign({ ...data }, this.jwtSecret, {
            algorithm: 'HS256',
            expiresIn: ExpiracionToken.TOKEN,
        })
    }

    verificarToken(token: string | undefined): ITokenDecode {
        try {
            if (!token) {
                throw new CustomError(this.NO_TOKEN_ERROR, 401, true)
            }

            if (!token.startsWith('Bearer ')) {
                throw new CustomError(this.INVALID_TOKEN_FORMAT_ERROR, 400, true)
            }

            const tokenValue = token.split(' ')[1]
            const decoded = jwt.verify(tokenValue, this.jwtSecret)

            return decoded as unknown as ITokenDecode
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            }

            if (error.name === 'TokenExpiredError') {
                throw new CustomError(this.TOKEN_EXPIRED_ERROR, 401, true)
            }

            throw new CustomError(this.INVALID_TOKEN_ERROR, 401, true)
        }
    }
}

export default TokenService
