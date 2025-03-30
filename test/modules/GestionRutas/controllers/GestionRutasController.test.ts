import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { Req } from '@modules/shared/infrastructure'
import Result from '@common/http/Result'
import { validateData } from '@common/util/Schemas'
import GestionRutasController from '@modules/GestionRutas/controllers/GestionRutasController'
import PlanificarRutasUseCase from '@modules/GestionRutas/usecase/services/PlanificarRutasUseCase'
import ReplanificarRutasUseCase from '@modules/GestionRutas/usecase/services/ReplanificarRutasUseCase'
import TYPESDEPENDENCIES from '@modules/GestionRutas/dependencies/TypesDependencies'
import BadMessageException from '@common/http/exceptions/BadMessageException'

jest.mock('@common/dependencies/DependencyContainer')
jest.mock('@common/util/Schemas')

describe('GestionRutasController', () => {
    let gestionRutasController: GestionRutasController
    let planificarRutasUseCaseMock: jest.Mocked<PlanificarRutasUseCase>
    let replanificarRutasUseCaseMock: jest.Mocked<ReplanificarRutasUseCase>
    
    beforeEach(() => {
        planificarRutasUseCaseMock = {
            execute: jest.fn()
        } as unknown as jest.Mocked<PlanificarRutasUseCase>
        
        replanificarRutasUseCaseMock = {
            execute: jest.fn()
        } as unknown as jest.Mocked<ReplanificarRutasUseCase>
        
        (DEPENDENCY_CONTAINER.get as jest.Mock).mockImplementation((type) => {
            if (type === TYPESDEPENDENCIES.PlanificarRutasUseCase) {
                return planificarRutasUseCaseMock
            }
            if (type === TYPESDEPENDENCIES.ReplanificarRutasUseCase) {
                return replanificarRutasUseCaseMock
            }
            return null
        })
        
        
        gestionRutasController = new GestionRutasController()
    })
    
    afterEach(() => {
        jest.clearAllMocks()
    })
    
    describe('planificarRutas', () => {
        it('debe planificar rutas correctamente', async () => {
            const idEquipo = 123
            const req: Req = {
                data: { idEquipo }
            } as Req
            (validateData as jest.Mock).mockReturnValue({idEquipo});
            const expectedResult = Result.ok({ ok: 'Se planificaron correctamente las rutas' })
            
            const result = await gestionRutasController.planificarRutas(req)
            
            expect(validateData).toHaveBeenCalled()
            expect(planificarRutasUseCaseMock.execute).toHaveBeenCalledWith(idEquipo)
            expect(result).toEqual(expectedResult)
        })
        
        
        it('debe validar los datos de entrada correctamente', async () => {
            const idEquipo = 123
            const req: Req = {
                data: { idEquipo }
            } as Req
            
            (validateData as jest.Mock).mockImplementation((schema, data) => {
                if (data.idEquipo === 123) {
                    return { idEquipo: 123 }
                }
                throw new Error('Datos inválidos')
            })
            
            const expectedResult = Result.ok({ ok: 'Se planificaron correctamente las rutas' })
            
            const result = await gestionRutasController.planificarRutas(req)
            
            expect(validateData).toHaveBeenCalled()
            expect(planificarRutasUseCaseMock.execute).toHaveBeenCalledWith(idEquipo)
            expect(result).toEqual(expectedResult)
        })
    })
    
    describe('replanificarRutas', () => {
        it('debe replanificar rutas correctamente', async () => {
            const idEquipo = 123
            const req: Req = {
                data: { idEquipo }
            } as Req
            
            const expectedResult = Result.ok({ ok: 'Se replanificaron correctamente las rutas' })
            
            const result = await gestionRutasController.replanificarRutas(req)
            
            expect(validateData).toHaveBeenCalled()
            expect(replanificarRutasUseCaseMock.execute).toHaveBeenCalledWith(idEquipo)
            expect(result).toEqual(expectedResult)
        })
        
        it('debe manejar errores durante la replanificación de rutas', async () => {
            const idEquipo = 123
            const req: Req = {
                data: { idEquipo }
            } as Req
            
            const mockError = new Error('Error en replanificación')
            replanificarRutasUseCaseMock.execute.mockRejectedValue(mockError)
            
            await expect(gestionRutasController.replanificarRutas(req)).rejects.toThrow(mockError)
            expect(validateData).toHaveBeenCalled()
            expect(replanificarRutasUseCaseMock.execute).toHaveBeenCalledWith(idEquipo)
        })
        
        it('debe validar los datos de entrada correctamente para replanificación', async () => {
            const idEquipo = 123
            const req: Req = {
                data: { idEquipo }
            } as Req
            
            (validateData as jest.Mock).mockImplementation((schema, data) => {
                if (data.idEquipo === 123) {
                    return { idEquipo: 123 }
                }
                throw new Error('Datos inválidos')
            })
            
            const expectedResult = Result.ok({ ok: 'Se replanificaron correctamente las rutas' })
            
            const result = await gestionRutasController.replanificarRutas(req)
            
            expect(validateData).toHaveBeenCalled()
            expect(replanificarRutasUseCaseMock.execute).toHaveBeenCalledWith(idEquipo)
            expect(result).toEqual(expectedResult)
        })
        
        it('debe rechazar datos inválidos para replanificación', async () => {
            const req: Req = {
                data: { idEquipo: null }
            } as Req
            
            const errorValidacion = new BadMessageException('Error de validación', 'Los datos no son válidos');
            
            (validateData as jest.Mock).mockImplementation(() => {
                throw errorValidacion
            })
            
            await expect(gestionRutasController.replanificarRutas(req)).rejects.toThrow(errorValidacion)
            expect(validateData).toHaveBeenCalled()
            expect(replanificarRutasUseCaseMock.execute).not.toHaveBeenCalled()
        })
    })
})