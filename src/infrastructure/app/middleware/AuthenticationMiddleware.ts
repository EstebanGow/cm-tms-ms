import { FastifyRequest } from 'fastify'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import TokenService from '@infrastructure/services/TokenService'

interface AuthenticatedRequest extends FastifyRequest {
    headers: {
        authorization?: string
    }
}

const AuthenticationMiddleware = async (request: AuthenticatedRequest) => {
    const tokenService = DEPENDENCY_CONTAINER.get<TokenService>(TYPESDEPENDENCIESGLOBAL.TokenService)
    const token = request.headers.authorization
    tokenService.verificarToken(token)
}

export default AuthenticationMiddleware
