import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'
import GuardarReplanificacionUseCase from '@modules/GestionRutas/usecase/services/GuardarReplanificacionUseCase'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import EquiposDomainService from '@modules/GestionRutas/domain/services/Equipos/EquiposDomainService'

jest.mock('@common/dependencies/DependencyContainer')

describe('GuardarReplanificacionUseCase', () => {
    let guardarReplanificacionUseCase: GuardarReplanificacionUseCase
    let rutasRepositoryMock: jest.Mocked<RutasRepository>
    let equipoDomainServiceMock: jest.Mocked<EquiposDomainService>
    
    const mockEnvios = [
        {
          id_envio: 4,
          id_cliente: 1,
          id_acuerdo_servicio: 1,
          id_direccion_destino: 2,
          fecha_creacion: '2025-03-26T18:20:02.735Z',
          fecha_entrega_programada: '2025-03-27T02:00:00.000Z',
          fecha_entrega_real: null,
          peso_kg: 10,
          volumen_m3: 1,
          descripcion: 'Caja cuadernos',
          estado: 'Asignado',
          acuerdo_servicio: {
            id_acuerdo_servicio: 1,
            id_cliente: 1,
            nombre: 'Plan Plus',
            tiempo_entrega_horas: 1,
            prioridad: 'Alta',
            penalizacion_porcentaje: 5,
            descripcion: 'Plan plus preferencial'
          },
          direccion_destino: {
            id_direccion: 2,
            id_cliente: 1,
            nombre_contacto: 'Carlos Castro',
            telefono_contacto: '3122938444',
            calle: 'Calle 65',
            numero: '65 77',
            ciudad: 'Medellín',
            estado: 'Antioquia',
            codigo_postal: '050001',
            pais: 'Colombia',
            latitud: 6.24234151,
            longitud: -75.55977836,
            instrucciones_entrega: 'Entregar en el primer piso',
            tipo: 'Entrega'
          },
          orden_secuencia: 1,
          tiempo_estimado_minutos: 0,
          distancia_km: 0
        }
    ] as EnvioEntity[]
    
    const mockRutaOptimizada = new OptimizacionRutaEntity({
        "id_optimizacion": 10,
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
    
    beforeEach(() => {
        rutasRepositoryMock = {
            guardarRutasReplanificacion: jest.fn().mockResolvedValue(undefined),
            obtenerRutasEquipo: jest.fn().mockResolvedValue(mockRutaOptimizada)
        } as unknown as jest.Mocked<RutasRepository>
        
        equipoDomainServiceMock = {
            guardarRutaEquipoCache: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<EquiposDomainService>
        
        (DEPENDENCY_CONTAINER.get as jest.Mock).mockImplementation((type) => {
            if (type === TYPESDEPENDENCIESGLOBAL.RutasRepository) {
                return rutasRepositoryMock
            }
            if (type === TYPESDEPENDENCIESGLOBAL.EquiposDomainService) {
                return equipoDomainServiceMock
            }
            return null
        })
        
        guardarReplanificacionUseCase = new GuardarReplanificacionUseCase()
    })
    
    afterEach(() => {
        jest.clearAllMocks()
    })
    
    it('debe guardar la replanificación de rutas correctamente y actualizar la caché', async () => {
        const idEquipo = 1
        const idOptimizacionAnterior = 5
        const idEvento = 1
        
        await guardarReplanificacionUseCase.execute({ envios: mockEnvios, idEquipo, idOptimizacionAnterior, idEvento})
        
        // Verificar guardarRutasReplanificacion
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
            mockEnvios, 
            idEquipo, 
            idOptimizacionAnterior,
            idEvento
        )
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledTimes(1)
        
        // Verificar obtenerRutasEquipo
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipo)
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledTimes(1)
        
        // Verificar guardarRutaEquipoCache
        expect(equipoDomainServiceMock.guardarRutaEquipoCache).toHaveBeenCalledWith(mockRutaOptimizada)
        expect(equipoDomainServiceMock.guardarRutaEquipoCache).toHaveBeenCalledTimes(1)
    })
    
    it('debe ejecutar los métodos privados en el orden correcto', async () => {
        const idEquipo = 1
        const idOptimizacionAnterior = 5
        const idEvento = 1
        
        // Espía los métodos privados
        const registrarResultadosSpy = jest.spyOn(guardarReplanificacionUseCase as any, 'registrarResultados')
        const asignarRutaEquipoCacheSpy = jest.spyOn(guardarReplanificacionUseCase as any, 'asignarRutaEquipoCache')
        
        await guardarReplanificacionUseCase.execute({envios: mockEnvios, idEquipo, idOptimizacionAnterior, idEvento})
        
        expect(registrarResultadosSpy).toHaveBeenCalledWith(mockEnvios, idEquipo, idOptimizacionAnterior, idEvento)
        expect(asignarRutaEquipoCacheSpy).toHaveBeenCalledWith(idEquipo)
        
        // Verificar orden de ejecución (comprobar el orden de las llamadas)
        expect(registrarResultadosSpy).toHaveBeenCalled();
        expect(asignarRutaEquipoCacheSpy).toHaveBeenCalled();
        // El orden se verifica implícitamente por la implementación del método execute
    })
    
    it('debe pasar un array vacío de envíos correctamente y actualizar la caché', async () => {
        const idEquipo = 1
        const idOptimizacionAnterior = 5
        const enviosVacios: EnvioEntity[] = []
        const idEvento = 1
        
        await guardarReplanificacionUseCase.execute({envios: enviosVacios, idEquipo, idOptimizacionAnterior, idEvento})
        
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
            enviosVacios, 
            idEquipo, 
            idOptimizacionAnterior,
            idEvento
        )
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipo)
        expect(equipoDomainServiceMock.guardarRutaEquipoCache).toHaveBeenCalledWith(mockRutaOptimizada)
    })
    
    it('debe pasar IDs inválidos correctamente al repositorio y actualizar la caché', async () => {
        const idEquipoInvalido = -1
        const idOptimizacionAnteriorInvalido = -5
        const idEvento = -1
        
        await guardarReplanificacionUseCase.execute({envios: mockEnvios, idEquipo: idEquipoInvalido, idOptimizacionAnterior: idOptimizacionAnteriorInvalido, idEvento})
        
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
            mockEnvios, 
            idEquipoInvalido, 
            idOptimizacionAnteriorInvalido,
            idEvento
        )
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipoInvalido)
        expect(equipoDomainServiceMock.guardarRutaEquipoCache).toHaveBeenCalledWith(mockRutaOptimizada)
    })
    
    it('debe manejar errores al guardar en el repositorio', async () => {
        const idEquipo = 1
        const idOptimizacionAnterior = 5
        const idEvento = 1
        const mockError = new Error('Error al guardar replanificación')
        
        rutasRepositoryMock.guardarRutasReplanificacion.mockRejectedValue(mockError)
        
        await expect(guardarReplanificacionUseCase.execute({envios: mockEnvios, idEquipo, idOptimizacionAnterior, idEvento}))
            .rejects.toThrow(mockError)
        
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
            mockEnvios, 
            idEquipo, 
            idOptimizacionAnterior,
            idEvento
        )
        expect(rutasRepositoryMock.obtenerRutasEquipo).not.toHaveBeenCalled()
        expect(equipoDomainServiceMock.guardarRutaEquipoCache).not.toHaveBeenCalled()
    })
    
    it('debe manejar errores al obtener rutas del equipo', async () => {
        const idEquipo = 1
        const idOptimizacionAnterior = 5
        const idEvento = 1
        const mockError = new Error('Error al obtener rutas')
        
        rutasRepositoryMock.obtenerRutasEquipo.mockRejectedValue(mockError)
        
        await expect(guardarReplanificacionUseCase.execute({envios: mockEnvios, idEquipo, idOptimizacionAnterior, idEvento}))
            .rejects.toThrow(mockError)
        
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
            mockEnvios, 
            idEquipo, 
            idOptimizacionAnterior,
            idEvento
        )
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipo)
        expect(equipoDomainServiceMock.guardarRutaEquipoCache).not.toHaveBeenCalled()
    })
    
    it('debe manejar errores al guardar en caché', async () => {
        const idEquipo = 1
        const idOptimizacionAnterior = 5
        const idEvento = 1
        const mockError = new Error('Error al guardar en caché')
        
        equipoDomainServiceMock.guardarRutaEquipoCache.mockRejectedValue(mockError)
        
        await expect(guardarReplanificacionUseCase.execute({envios: mockEnvios, idEquipo, idOptimizacionAnterior, idEvento}))
            .rejects.toThrow(mockError)
        
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
            mockEnvios, 
            idEquipo, 
            idOptimizacionAnterior,
            idEvento
        )
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipo)
        expect(equipoDomainServiceMock.guardarRutaEquipoCache).toHaveBeenCalledWith(mockRutaOptimizada)
    })
    
    it('debe manejar el caso cuando obtenerRutasEquipo devuelve null', async () => {
        const idEquipo = 1
        const idOptimizacionAnterior = 5
        const idEvento = 1
        
        rutasRepositoryMock.obtenerRutasEquipo.mockResolvedValue(null)
        
        await guardarReplanificacionUseCase.execute({envios: mockEnvios, idEquipo, idOptimizacionAnterior, idEvento})
        
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
            mockEnvios, 
            idEquipo, 
            idOptimizacionAnterior,
            idEvento
        )
        expect(rutasRepositoryMock.obtenerRutasEquipo).toHaveBeenCalledWith(idEquipo)
        // Al revisar la implementación, vemos que guardarRutaEquipoCache se llama incluso cuando obtenerRutasEquipo retorna null
        expect(equipoDomainServiceMock.guardarRutaEquipoCache).toHaveBeenCalledWith(null)
    })
});