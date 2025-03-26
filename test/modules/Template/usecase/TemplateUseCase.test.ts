import { ITemplateIn } from '@modules/Template/usecase/dto/in'
import createDependencies from '@modules/Template/dependencies/Dependencies'
import TemplateUseCase from '@modules/Template/usecase/services/TemplateUseCase'

describe('CrearTemplateUseCase', () => {
    let templateUseCase: TemplateUseCase
    beforeAll(async () => {
        createDependencies()
        templateUseCase = new TemplateUseCase()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('debería crear un cliente satisfactoriamente', async () => {
        const data: ITemplateIn = { nombre: 'template' }
        const result = await templateUseCase.execute(data)
        expect(result).toBe('ok')
    })
})
