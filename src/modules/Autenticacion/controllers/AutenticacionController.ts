import { Req } from '@modules/shared/infrastructure'
import { injectable } from 'inversify'
import { Response } from '@common/http/Response'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import Result from '@common/http/Result'
import { validateData } from '@common/util/Schemas'
import { Status } from '../../shared/infrastructure/Controller'
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies'
import AutenticacionUseCase from '../usecase/services/AutenticacionUseCase'
import IAutenticacionSchema from './schemas/IAutenticacionSchema'
import { IAutenticacionIn } from '../usecase/dto/in'

@injectable()
export default class AutenticacionController {
    private autenticacionUseCase = DEPENDENCY_CONTAINER.get<AutenticacionUseCase>(
        TYPESDEPENDENCIES.AutenticacionUseCase,
    )

    async autenticar(_req: Req): Promise<Response<Status | null>> {
        const data = validateData<IAutenticacionIn>(IAutenticacionSchema, _req.data)
        const token = await this.autenticacionUseCase.execute(data)
        return Result.ok<Status>({ ok: 'Autenticacion exitosa', token })
    }
}
