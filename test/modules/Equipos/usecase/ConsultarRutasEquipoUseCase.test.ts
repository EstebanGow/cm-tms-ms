import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { EquiposRepository } from '@modules/GestionRutas/domain/repositories/EquiposRepository'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import { RedisRepository } from '@common/repositories'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import ConsultarRutasEquipoUseCase from '@modules/Equipos/usecase/services/ConsultarRutasEquipoUseCase'
import { IEquipoIn } from '@modules/Equipos/usecase/dto/in'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'

jest.mock('@common/dependencies/DependencyContainer')

describe('ConsultarRutasEquipoUseCase', () => {
    let consultarRutasEquipoUseCase: ConsultarRutasEquipoUseCase
    let equiposRepositoryMock: jest.Mocked<EquiposRepository>
    let rutasRepositoryMock: jest.Mocked<RutasRepository>
    let redisRepositoryMock: jest.Mocked<RedisRepository>
    
    beforeEach(() => {
        equiposRepositoryMock = {
            obtenerRutasEquipo: jest.fn()
        } as unknown as jest.Mocked<EquiposRepository>
        
        rutasRepositoryMock = {
            obtenerRutasEquipo: jest.fn()
        } as unknown as jest.Mocked<RutasRepository>
        
        redisRepositoryMock = {
            consultar: jest.fn()
        } as unknown as jest.Mocked<RedisRepository>
        
        (DEPENDENCY_CONTAINER.get as jest.Mock).mockImplementation((type) => {
            if (type === TYPESDEPENDENCIES.EquiposRepository) {
                return equiposRepositoryMock
            }
            if (type === TYPESDEPENDENCIES.RutasRepository) {
                return rutasRepositoryMock
            }
            if (type === TYPESDEPENDENCIES.RedisRepository) {
                return redisRepositoryMock
            }
            return null
        })
        
        consultarRutasEquipoUseCase = new ConsultarRutasEquipoUseCase()
    })
    
    afterEach(() => {
        jest.clearAllMocks()
    })
    
    it('debe obtener las rutas de un equipo desde caché correctamente', async () => {
        const idEquipo = 123
        const mockOptimizacionRuta = new OptimizacionRutaEntity({
            "id_optimizacion": 1,
            "id_equipo": 1,
            "fecha_optimizacion": "2025-03-26T05:00:00.000Z",
            "estado": "Vigente",
            "detalles_optimizacion": [
                {
                    "id_envio": 4,
                    "direccion": {
                        "pais": "Colombia",
                        "calle": "Calle 65",
                        "ciudad": "Medellin",
                        "estado": "Antioquia",
                        "numero": "65 77",
                        "latitud": 6.24234151,
                        "longitud": -75.55977836,
                        "id_direccion": 2,
                        "codigo_postal": "050001",
                        "nombre_contacto": "Carlos Castro",
                        "telefono_contacto": "3122938444",
                        "instrucciones_entrega": "Entregar en el primer piso"
                    },
                    "orden_secuencia": 1,
                    "hora_estimada_llegada": "2025-03-27T10:30:00",
                    "distancia_siguiente_parada_km": 10,
                    "tiempo_estimado_siguiente_parada_minutos": 30
                }
            ],
            "info_equipo": {
                "estado": "Activo",
                "id_equipo": 1,
                "id_vehiculo": 1,
                "id_conductor": 2,
                "fecha_asignacion": "2025-03-26"
            }
        })
        const mockInput: IEquipoIn = { idEquipo }
        
        redisRepositoryMock.consultar.mockResolvedValue(mockOptimizacionRuta)
        
        const resultado = await consultarRutasEquipoUseCase.execute(mockInput)
        
        expect(redisRepositoryMock.consultar).toHaveBeenCalledWith(`ruta-${idEquipo}`)
        expect(rutasRepositoryMock.obtenerRutasEquipo).not.toHaveBeenCalled()
        expect(resultado).toBe(mockOptimizacionRuta)
    })
    
    it('debe obtener las rutas de un equipo desde el repositorio cuando no hay caché', async () => {
        const idEquipo = 123
        const mockOptimizacionRuta = new OptimizacionRutaEntity({
            "id_optimizacion": 1,
            "id_equipo": 1,
            "fecha_optimizacion": "2025-03-26T05:00:00.000Z",
            "estado": "Vigente",
            "detalles_optimizacion": [
                {
                    "id_envio": 4,
                    "direccion": {
                        "pais": "Colombia",
                        "calle": "Calle 65",
                        "ciudad": "Medellin",
                        "estado": "Antioquia",
                        "numero": "65 77",
                        "latitud": 6.24234151,
                        "longitud": -75.55977836,
                        "id_direccion": 2,
                        "codigo_postal": "050001",
                        "nombre_contacto": "Carlos Castro",
                        "telefono_contacto": "3122938444",
                        "instrucciones_entrega": "Entregar en el primer piso"
                    },
                    "orden_secuencia": 1,
                    "hora_estimada_llegada": "2025-03-27T10:30:00",
                    "distancia_siguiente_parada_km": 10,
                    "tiempo_estimado_siguiente_parada_minutos": 30
                }
            ],
            "info_equipo": {
                "estado": "Activo",
                "id_equipo": 1,
                "id_vehiculo": 1,
                "id_conductor": 2,
                "fecha_asignacion": "2025-03-26"
            }
        })
        const mockInput: IEquipoIn = { idEquipo }
        
        redisRepositoryMock.consultar.mockResolvedValue(null)
        rutasRepositoryMock.obtenerRutasEquipo.mockResolvedValue(mockOptimizacionRuta)
        
        const resultado = await consultarRutasEquipoUseCase.execute(mockInput)
        
        expect(redisRepositoryMock.consultar).toHaveBeenCalledWith(`ruta-${idEquipo}`)
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipo)
        expect(resultado).toBe(mockOptimizacionRuta)
    })
    
    it('debe lanzar BadMessageException cuando no hay rutas para el equipo ni en caché ni en repositorio', async () => {
        const idEquipo = 123
        const mockInput: IEquipoIn = { idEquipo }
        
        redisRepositoryMock.consultar.mockResolvedValue(null)
        rutasRepositoryMock.obtenerRutasEquipo.mockResolvedValue(null)
        
        await expect(consultarRutasEquipoUseCase.execute(mockInput)).rejects.toThrow(BadMessageException)
        await expect(consultarRutasEquipoUseCase.execute(mockInput)).rejects.toThrow('El equipo no tiene una ruta activa')
        
        expect(redisRepositoryMock.consultar).toHaveBeenCalledWith(`ruta-${idEquipo}`)
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipo)
    })
    
    it('debe lanzar excepción cuando el redis repository lanza error', async () => {
        const idEquipo = 123
        const mockInput: IEquipoIn = { idEquipo }
        const mockError = new Error('Error de redis')
        
        redisRepositoryMock.consultar.mockRejectedValue(mockError)
        
        await expect(consultarRutasEquipoUseCase.execute(mockInput)).rejects.toThrow(mockError)
        expect(redisRepositoryMock.consultar).toHaveBeenCalledWith(`ruta-${idEquipo}`)
        expect(rutasRepositoryMock.obtenerRutasEquipo).not.toHaveBeenCalled()
    })
    
    it('debe lanzar excepción cuando el rutas repository lanza error', async () => {
        const idEquipo = 123
        const mockInput: IEquipoIn = { idEquipo }
        const mockError = new Error('Error de repositorio')
        
        redisRepositoryMock.consultar.mockResolvedValue(null)
        rutasRepositoryMock.obtenerRutasEquipo.mockRejectedValue(mockError)
        
        await expect(consultarRutasEquipoUseCase.execute(mockInput)).rejects.toThrow(mockError)
        expect(redisRepositoryMock.consultar).toHaveBeenCalledWith(`ruta-${idEquipo}`)
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipo)
    })
})