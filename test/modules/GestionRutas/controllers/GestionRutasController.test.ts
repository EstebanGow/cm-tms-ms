import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { Req } from '@modules/shared/infrastructure'
import Result from '@common/http/Result'
import { validateData, validateDataPubSub } from '@common/util/Schemas'
import GestionRutasController from '@modules/GestionRutas/controllers/GestionRutasController'
import PlanificarRutasUseCase from '@modules/GestionRutas/usecase/services/PlanificarRutasUseCase'
import ReplanificarRutasUseCase from '@modules/GestionRutas/usecase/services/ReplanificarRutasUseCase'
import GuardarPlanificacionUseCase from '@modules/GestionRutas/usecase/services/GuardarPlanificacionUseCase'
import GuardarReplanificacionUseCase from '@modules/GestionRutas/usecase/services/GuardarReplanificacionUseCase'
import TYPESDEPENDENCIES from '@modules/GestionRutas/dependencies/TypesDependencies'

jest.mock('@common/dependencies/DependencyContainer')
jest.mock('@common/util/Schemas')

describe('GestionRutasController', () => {
    let gestionRutasController: GestionRutasController
    let planificarRutasUseCaseMock: jest.Mocked<PlanificarRutasUseCase>
    let replanificarRutasUseCaseMock: jest.Mocked<ReplanificarRutasUseCase>
    let guardarPlanificacionUseCaseMock: jest.Mocked<GuardarPlanificacionUseCase>
    let guardarReplanificacionUseCaseMock: jest.Mocked<GuardarReplanificacionUseCase>
    
    beforeEach(() => {
        planificarRutasUseCaseMock = {
            execute: jest.fn()
        } as unknown as jest.Mocked<PlanificarRutasUseCase>
        
        replanificarRutasUseCaseMock = {
            execute: jest.fn()
        } as unknown as jest.Mocked<ReplanificarRutasUseCase>
        
        guardarPlanificacionUseCaseMock = {
            execute: jest.fn()
        } as unknown as jest.Mocked<GuardarPlanificacionUseCase>
        
        guardarReplanificacionUseCaseMock = {
            execute: jest.fn()
        } as unknown as jest.Mocked<GuardarReplanificacionUseCase>
        
        (DEPENDENCY_CONTAINER.get as jest.Mock).mockImplementation((type) => {
            if (type === TYPESDEPENDENCIES.PlanificarRutasUseCase) {
                return planificarRutasUseCaseMock
            }
            if (type === TYPESDEPENDENCIES.ReplanificarRutasUseCase) {
                return replanificarRutasUseCaseMock
            }
            if (type === TYPESDEPENDENCIES.GuardarPlanificacionUseCase) {
                return guardarPlanificacionUseCaseMock
            }
            if (type === TYPESDEPENDENCIES.GuardarReplanificacionUseCase) {
                return guardarReplanificacionUseCaseMock
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
            (validateData as jest.Mock).mockReturnValue({idEquipo})
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
                throw Error('Datos inválidos')
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
            
            const mockError = Error('Error en replanificación')
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
                throw Error('Datos inválidos')
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
            
            const testError = Error()
            
            ;(validateData as jest.Mock).mockImplementation(() => {
                throw testError
            })
            
            await expect(gestionRutasController.replanificarRutas(req)).rejects.toThrow()
            
            expect(validateData).toHaveBeenCalled()
            expect(replanificarRutasUseCaseMock.execute).not.toHaveBeenCalled()
        })
    })

    describe('guardarPlanificacionRutas', () => {
        it('debe guardar la planificación de rutas correctamente', async () => {
            const envios = [{ id: 1 }, { id: 2 }]
            const idEquipo = 123
            const req: Req = {
                data: { envios, idEquipo }
            } as Req
            
            ;(validateDataPubSub as jest.Mock).mockReturnValue({ envios, idEquipo })
            
            const expectedResult = Result.ok({ ok: 'Se replanificaron correctamente las rutas' })
            
            const result = await gestionRutasController.guardarPlanificacionRutas(req)
            
            expect(validateDataPubSub).toHaveBeenCalled()
            expect(guardarPlanificacionUseCaseMock.execute).toHaveBeenCalledWith(envios, idEquipo)
            expect(result).toEqual(expectedResult)
        })
        
        it('debe manejar errores durante el guardado de la planificación', async () => {
            const envios = [{ id: 1 }, { id: 2 }]
            const idEquipo = 123
            const req: Req = {
                data: { envios, idEquipo }
            } as Req
            
            ;(validateDataPubSub as jest.Mock).mockReturnValue({ envios, idEquipo })
            
            const mockError = Error('Error en guardado de planificación')
            guardarPlanificacionUseCaseMock.execute.mockRejectedValue(mockError)
            
            await expect(gestionRutasController.guardarPlanificacionRutas(req)).rejects.toThrow(mockError)
            expect(validateDataPubSub).toHaveBeenCalled()
            expect(guardarPlanificacionUseCaseMock.execute).toHaveBeenCalledWith(envios, idEquipo)
        })
        
        it('debe validar los datos de entrada correctamente para guardar planificación', async () => {
            const envios = [{ id: 1 }, { id: 2 }]
            const idEquipo = 123
            const req: Req = {
                data: { envios, idEquipo }
            } as Req
            
            ;(validateDataPubSub as jest.Mock).mockImplementation((schema, data) => {
                if (data.idEquipo === 123) {
                    return { envios, idEquipo }
                }
                throw Error('Datos inválidos')
            })
            
            const expectedResult = Result.ok({ ok: 'Se replanificaron correctamente las rutas' })
            
            const result = await gestionRutasController.guardarPlanificacionRutas(req)
            
            expect(validateDataPubSub).toHaveBeenCalled()
            expect(guardarPlanificacionUseCaseMock.execute).toHaveBeenCalledWith(envios, idEquipo)
            expect(result).toEqual(expectedResult)
        })
        
        it('debe rechazar datos inválidos para guardar planificación', async () => {
            const req: Req = {
                data: { envios: null, idEquipo: null }
            } as Req
            
            const testError = Error()
            
            ;(validateDataPubSub as jest.Mock).mockImplementation(() => {
                throw testError
            })
            
            await expect(gestionRutasController.guardarPlanificacionRutas(req)).rejects.toThrow()
            
            expect(validateDataPubSub).toHaveBeenCalled()
            expect(guardarPlanificacionUseCaseMock.execute).not.toHaveBeenCalled()
        })
    })
    
    describe('guardarReplanificacionRutas', () => {
        it('debe guardar la replanificación de rutas correctamente', async () => {
            const envios = [{ id: 1 }, { id: 2 }]
            const idEquipo = 123
            const idOptimizacionAnterior = 456
            const idEvento = 1
            const req: Req = {
                data: { envios, idEquipo, idOptimizacionAnterior }
            } as Req
            
            ;(validateDataPubSub as jest.Mock).mockReturnValue({ envios, idEquipo, idOptimizacionAnterior, idEvento })
            
            const expectedResult = Result.ok({ ok: 'Se replanificaron correctamente las rutas' })
            
            const result = await gestionRutasController.guardarReplanificacionRutas(req)
            
            expect(validateDataPubSub).toHaveBeenCalled()
            expect(guardarReplanificacionUseCaseMock.execute).toHaveBeenCalledWith({envios, idEquipo, idOptimizacionAnterior, idEvento})
            expect(result).toEqual(expectedResult)
        })
        
        it('debe manejar errores durante el guardado de la replanificación', async () => {
            const envios = [{ id: 1 }, { id: 2 }]
            const idEquipo = 123
            const idOptimizacionAnterior = 456
            const idEvento = 1
            const req: Req = {
                data: { envios, idEquipo, idOptimizacionAnterior }
            } as Req
            
            ;(validateDataPubSub as jest.Mock).mockReturnValue({ envios, idEquipo, idOptimizacionAnterior, idEvento })
            
            const mockError = Error('Error en guardado de replanificación')
            guardarReplanificacionUseCaseMock.execute.mockRejectedValue(mockError)
            
            await expect(gestionRutasController.guardarReplanificacionRutas(req)).rejects.toThrow(mockError)
            expect(validateDataPubSub).toHaveBeenCalled()
            expect(guardarReplanificacionUseCaseMock.execute).toHaveBeenCalledWith({envios, idEquipo, idOptimizacionAnterior, idEvento})
        })
        
        it('debe validar los datos de entrada correctamente para guardar replanificación', async () => {
            const envios = [{ id: 1 }, { id: 2 }]
            const idEquipo = 123
            const idOptimizacionAnterior = 456
            const idEvento = 1
            const req: Req = {
                data: { envios, idEquipo, idOptimizacionAnterior }
            } as Req
            
            ;(validateDataPubSub as jest.Mock).mockImplementation((schema, data) => {
                if (data.idEquipo === 123) {
                    return { envios, idEquipo, idOptimizacionAnterior, idEvento }
                }
                throw Error('Datos inválidos')
            })
            
            const expectedResult = Result.ok({ ok: 'Se replanificaron correctamente las rutas' })
            
            const result = await gestionRutasController.guardarReplanificacionRutas(req)
            
            expect(validateDataPubSub).toHaveBeenCalled()
            expect(guardarReplanificacionUseCaseMock.execute).toHaveBeenCalledWith({envios, idEquipo, idOptimizacionAnterior, idEvento})
            expect(result).toEqual(expectedResult)
        })
        
        it('debe rechazar datos inválidos para guardar replanificación', async () => {
            const req: Req = {
                data: { envios: null, idEquipo: null, idOptimizacionAnterior: null }
            } as Req
            
            const testError = Error()
            
            ;(validateDataPubSub as jest.Mock).mockImplementation(() => {
                throw testError
            })
            
            await expect(gestionRutasController.guardarReplanificacionRutas(req)).rejects.toThrow()
            
            expect(validateDataPubSub).toHaveBeenCalled()
            expect(guardarReplanificacionUseCaseMock.execute).not.toHaveBeenCalled()
        })
    })
})