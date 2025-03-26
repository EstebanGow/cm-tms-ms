import createDependencies from '@modules/Template/dependencies/Dependencies'
import { Req, Status } from '@modules/shared/infrastructure'
import TemplateController from '@modules/Template/controllers/TemplateController'
import { Response } from '@common/http/Response'

let templateController: TemplateController

describe('TemplateController', () => {
    beforeAll(async () => {
        createDependencies()
        templateController = new TemplateController()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('Crear cliente satisfactoriamente', async () => {
        //ARRANGE
        const data = {
            nombre: 'template',
        }

        const request: Req = { body: {}, params: {}, data: data }

        const mockCrearClienteUseCase = jest
            .spyOn(templateController['templateUseCase'], 'execute')
            .mockResolvedValue('ok')

        //ACT
        const response: Response<Status | null> = await templateController.guardar(request)

        //ASSERT
        expect(mockCrearClienteUseCase).toHaveBeenCalledWith(data)
        expect(response.status).toBe(200)
        expect(response.response.data?.ok).toBe('Se ejecuto correctamente el template')
    })
})
