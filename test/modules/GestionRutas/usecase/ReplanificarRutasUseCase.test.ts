import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import EquiposDomainService from '@modules/GestionRutas/domain/services/Equipos/EquiposDomainService'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import EnviosDomainService from '@modules/GestionRutas/domain/services/Envios/EnviosDomainService'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import CondicionesDomainService from '@modules/GestionRutas/domain/services/Condiciones/CondicionesDomainService'
import EstrategiaFactory from '@modules/GestionRutas/domain/strategies/EstrategiaFactory'
import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'
import OrdenadorRutas from '@modules/GestionRutas/domain/strategies/OrdenadorRutas'
import EquipoEntity from '@modules/GestionRutas/domain/entities/EquipoEntity'
import ReplanificarRutasUseCase from '@modules/GestionRutas/usecase/services/ReplanificarRutasUseCase'
import { publisher } from '@infrastructure/app/events/pubsub/PubSubBatch'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'

jest.mock('@common/dependencies/DependencyContainer')

jest.mock('@infrastructure/app/events/pubsub/PubSubBatch', () => ({
    publisher: jest.fn().mockResolvedValue(undefined)
}))

describe('ReplanificarRutasUseCase', () => {
    let replanificarRutasUseCase: ReplanificarRutasUseCase
    let rutasRepositoryMock: jest.Mocked<RutasRepository>
    let equiposDomainServiceMock: jest.Mocked<EquiposDomainService>
    let enviosDomainServiceMock: jest.Mocked<EnviosDomainService>
    let condicionesDomainServiceMock: jest.Mocked<CondicionesDomainService>
    let estrategiaFactoryMock: jest.Mocked<EstrategiaFactory>
    let ordenadorRutasMock: jest.Mocked<OrdenadorRutas>
    let estrategiaMock: any
    
    const mockEquipo = {
        id_equipo: 1,
        id_conductor: 2,
        id_vehiculo: 1,
        fecha_asignacion: '2025-03-26T05:00:00.000Z',
        estado: 'Activo',
        ruta_activa: 12,
        conductor: {
          email: 'carlos@gmail.com',
          estado: 'Disponible',
          nombre: 'Carlos',
          telefono: '3225517821',
          apellidos: 'Castro',
          id_conductor: 2,
          licencia_conducir: '20005144',
          fecha_contratacion: '2025-03-26',
          ultima_actualizacion: '2025-03-26T11:58:28.746153'
        },
        vehiculo: {
          tipo: 'Camión',
          marca: 'CHEVROLET',
          placa: 'QFH097',
          estado: 'Activo',
          modelo: '2020',
          referencia: 'NPR',
          id_vehiculo: 1,
          capacidad_kg: 4500,
          capacidad_volumen_m3: 4,
          ultima_actualizacion: '2025-03-26T13:35:06.581687'
        },
        ubicacion: {
          ciudad: 'Medellín',
          latitud: 6.24234151,
          longitud: -75.55977836,
          direccion: null,
          timestamp: '2025-03-28T19:23:21.501013',
          velocidad: 10,
          id_ubicacion: 1
        }
      } as EquipoEntity
    
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
    
    const mockEventosInesperados = [
      {
        id: 1,
        tipo: 'Manifestación',
        latitud: 6.25,
        longitud: -75.56,
        radio_afectacion_km: 0.5,
        descripcion: 'Manifestación en el centro'
      }
    ]

    const mockRutaActiva = {
        id_optimizacion: 12,
        id_equipo: 1,
        fecha_optimizacion: '2025-03-28',
        timestamp_optimizacion: '2025-03-28T15:30:00.000Z',
        estado: 'Activo',
        tiempo_total_estimado_minutos: 120,
        distancia_total_km: 35,
        consumo_combustible_estimado_litros: 4.5,
        nuevo_evento: true
    } as OptimizacionRutaEntity
    
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
        
        estrategiaMock = {
            ordenar: jest.fn().mockReturnValue([...mockEnvios])
        }
        
        rutasRepositoryMock = {
            guardarRutasReplanificacion: jest.fn().mockResolvedValue(undefined),
            consultarRutaActivaEquipo: jest.fn().mockResolvedValue(mockRutaActiva)
        } as unknown as jest.Mocked<RutasRepository>
        
        equiposDomainServiceMock = {
            consultarEquipo: jest.fn().mockResolvedValue(mockEquipo),
            validarEquipoReplanificacion: jest.fn()
        } as unknown as jest.Mocked<EquiposDomainService>
        
        enviosDomainServiceMock = {
            consultarEnviosOptimizacion: jest.fn().mockResolvedValue(mockEnvios),
            ordenarEnviosPorPrioridad: jest.fn().mockReturnValue(mockEnvios)
        } as unknown as jest.Mocked<EnviosDomainService>
        
        condicionesDomainServiceMock = {
            consultarEventosInesperados: jest.fn().mockResolvedValue(mockEventosInesperados)
        } as unknown as jest.Mocked<CondicionesDomainService>
        
        estrategiaFactoryMock = {
            crearEstrategiaOptima: jest.fn().mockReturnValue(estrategiaMock)
        } as unknown as jest.Mocked<EstrategiaFactory>
        
        ordenadorRutasMock = {
            setStrategy: jest.fn(),
            ordenarEnvios: jest.fn().mockReturnValue(mockEnvios)
        } as unknown as jest.Mocked<OrdenadorRutas>
        
        (DEPENDENCY_CONTAINER.get as jest.Mock).mockImplementation((type) => {
            if (type === TYPESDEPENDENCIESGLOBAL.RutasRepository) {
                return rutasRepositoryMock
            }
            if (type === TYPESDEPENDENCIESGLOBAL.EquiposDomainService) {
                return equiposDomainServiceMock
            }
            if (type === TYPESDEPENDENCIESGLOBAL.EnviosDomainService) {
                return enviosDomainServiceMock
            }
            if (type === TYPESDEPENDENCIESGLOBAL.CondicionesDomainService) {
                return condicionesDomainServiceMock
            }
            if (type === TYPESDEPENDENCIESGLOBAL.EstrategiaFactory) {
                return estrategiaFactoryMock
            }
            if (type === TYPESDEPENDENCIESGLOBAL.OrdenadorRutas) {
                return ordenadorRutasMock
            }
            return null
        })
        
        replanificarRutasUseCase = new ReplanificarRutasUseCase()
    })
    
    afterEach(() => {
        jest.clearAllMocks()
    })
    
    it('debe replanificar rutas correctamente', (done) => {
        replanificarRutasUseCase.execute(1)
            .then(resultado => {
                expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
                expect(equiposDomainServiceMock.validarEquipoReplanificacion).toHaveBeenCalledWith(mockEquipo)
                expect(rutasRepositoryMock.consultarRutaActivaEquipo).toHaveBeenCalledWith(1, 'Medellín')
                expect(enviosDomainServiceMock.consultarEnviosOptimizacion).toHaveBeenCalledWith(mockEquipo.ruta_activa)
                expect(enviosDomainServiceMock.ordenarEnviosPorPrioridad).toHaveBeenCalledWith(mockEnvios)
                
                expect(condicionesDomainServiceMock.consultarEventosInesperados).toHaveBeenCalledWith('Medellín')
                
                expect(estrategiaFactoryMock.crearEstrategiaOptima).toHaveBeenCalledWith(
                    null,
                    null,
                    mockEventosInesperados
                )
                
                expect(ordenadorRutasMock.setStrategy).toHaveBeenCalledWith(estrategiaMock)
                expect(ordenadorRutasMock.ordenarEnvios).toHaveBeenCalledWith(
                    mockEnvios,
                    null,
                    null,
                    mockEventosInesperados
                )
                expect(publisher).toHaveBeenCalledWith({ envios: mockEnvios, idEquipo: 1, idOptimizacionAnterior: mockEquipo.ruta_activa }, 'esteban-replanificacion-ruta')
                expect(resultado).toEqual(mockEnvios)
                done()
            })
            .catch(done)
    })
    
    it('debe lanzar error cuando el equipo no existe', (done) => {
        equiposDomainServiceMock.consultarEquipo.mockResolvedValue(null)
        
        replanificarRutasUseCase.execute(1)
            .then(() => {
                done.fail('Debería haber lanzado una excepción')
            })
            .catch(error => {
                expect(error).toBeInstanceOf(BadMessageException)
                expect(error.message).toContain('El equipo solicitado no existe')
                
                expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
                expect(equiposDomainServiceMock.validarEquipoReplanificacion).not.toHaveBeenCalled()
                expect(enviosDomainServiceMock.consultarEnviosOptimizacion).not.toHaveBeenCalled()
                done()
            })
    })
    
    it('debe lanzar error cuando el equipo no es válido para replanificación', (done) => {
        const mockError = new BadMessageException('Error de validación', 'El equipo no tiene una ruta activa')
        
        equiposDomainServiceMock.validarEquipoReplanificacion.mockImplementation(() => {
            throw mockError
        })
        
        replanificarRutasUseCase.execute(1)
            .then(() => {
                done.fail('Debería haber lanzado una excepción')
            })
            .catch(error => {
                expect(error).toBe(mockError)
                
                expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
                expect(equiposDomainServiceMock.validarEquipoReplanificacion).toHaveBeenCalledWith(mockEquipo)
                expect(enviosDomainServiceMock.consultarEnviosOptimizacion).not.toHaveBeenCalled()
                done()
            })
    })
    
    it('debe lanzar error cuando no hay envíos disponibles', (done) => {
        enviosDomainServiceMock.consultarEnviosOptimizacion.mockResolvedValue([])
        
        replanificarRutasUseCase.execute(1)
            .then(() => {
                done.fail('Debería haber lanzado una excepción')
            })
            .catch(error => {
                expect(error).toBeInstanceOf(BadMessageException)
                expect(error.message).toContain('No hay envíos disponibles')
                
                expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
                expect(equiposDomainServiceMock.validarEquipoReplanificacion).toHaveBeenCalledWith(mockEquipo)
                expect(enviosDomainServiceMock.consultarEnviosOptimizacion).toHaveBeenCalledWith(mockEquipo.ruta_activa)
                expect(condicionesDomainServiceMock.consultarEventosInesperados).not.toHaveBeenCalled()
                done()
            })
    })
    
    it('debe manejar errores en la consulta de eventos inesperados', (done) => {
        const mockError = new Error('Error al consultar eventos inesperados')
        
        condicionesDomainServiceMock.consultarEventosInesperados.mockRejectedValue(mockError)
        
        replanificarRutasUseCase.execute(1)
            .then(() => {
                done.fail('Debería haber lanzado una excepción')
            })
            .catch(error => {
                expect(error).toBe(mockError)
                
                expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
                expect(enviosDomainServiceMock.consultarEnviosOptimizacion).toHaveBeenCalledWith(mockEquipo.ruta_activa)
                expect(condicionesDomainServiceMock.consultarEventosInesperados).toHaveBeenCalledWith('Medellín')
                expect(rutasRepositoryMock.guardarRutasReplanificacion).not.toHaveBeenCalled()
                done()
            })
    })
    
    it('verifica la llamada a guardarRutasReplanificacion', async () => {
        equiposDomainServiceMock.consultarEquipo.mockResolvedValue(mockEquipo)
        enviosDomainServiceMock.consultarEnviosOptimizacion.mockResolvedValue(mockEnvios)
        enviosDomainServiceMock.ordenarEnviosPorPrioridad.mockReturnValue(mockEnvios)
        condicionesDomainServiceMock.consultarEventosInesperados.mockResolvedValue(mockEventosInesperados)
        estrategiaFactoryMock.crearEstrategiaOptima.mockReturnValue(estrategiaMock)
        ordenadorRutasMock.ordenarEnvios.mockReturnValue(mockEnvios)
        
        rutasRepositoryMock.guardarRutasReplanificacion.mockResolvedValue(undefined)
        
        await replanificarRutasUseCase.execute(1)
        expect(publisher).toHaveBeenCalledWith({ envios: mockEnvios, idEquipo: 1, idOptimizacionAnterior: mockEquipo.ruta_activa }, 'esteban-replanificacion-ruta')
    })

    // Nuevos tests para cubrir los métodos faltantes
    
    it('debe lanzar error cuando no hay ruta activa para el equipo', (done) => {
        rutasRepositoryMock.consultarRutaActivaEquipo.mockResolvedValue(null)
        
        replanificarRutasUseCase.execute(1)
            .then(() => {
                done.fail('Debería haber lanzado una excepción')
            })
            .catch(error => {
                expect(error).toBeInstanceOf(BadMessageException)
                expect(error.message).toContain('No hay ruta activa para el equipo')
                
                expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
                expect(rutasRepositoryMock.consultarRutaActivaEquipo).toHaveBeenCalledWith(1, 'Medellín')
                expect(enviosDomainServiceMock.consultarEnviosOptimizacion).not.toHaveBeenCalled()
                done()
            })
    })
    
    it('debe lanzar error cuando no hay eventos nuevos', (done) => {
        const rutaActivaSinEventoNuevo = {
            ...mockRutaActiva,
            nuevo_evento: false
        }
        
        rutasRepositoryMock.consultarRutaActivaEquipo.mockResolvedValue(rutaActivaSinEventoNuevo)
        
        replanificarRutasUseCase.execute(1)
            .then(() => {
                done.fail('Debería haber lanzado una excepción')
            })
            .catch(error => {
                expect(error).toBeInstanceOf(BadMessageException)
                expect(error.message).toContain('No hay eventos nuevos')
                
                expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
                expect(rutasRepositoryMock.consultarRutaActivaEquipo).toHaveBeenCalledWith(1, 'Medellín')
                expect(enviosDomainServiceMock.consultarEnviosOptimizacion).not.toHaveBeenCalled()
                done()
            })
    })
    
    it('debe llamar a consultarRutaActivaEquipo con los parámetros correctos', async () => {
        await replanificarRutasUseCase.execute(1)
        expect(rutasRepositoryMock.consultarRutaActivaEquipo).toHaveBeenCalledWith(1, 'Medellín')
    })
    
    it('debe obtener condiciones actuales correctamente', async () => {
        await replanificarRutasUseCase.execute(1)
        expect(condicionesDomainServiceMock.consultarEventosInesperados).toHaveBeenCalledWith('Medellín')
    })
    
    it('debe manejar errores en ordenarEnvios', (done) => {
        const mockError = new Error('Error al ordenar envíos')
        
        ordenadorRutasMock.ordenarEnvios.mockImplementation(() => {
            throw mockError
        })
        
        replanificarRutasUseCase.execute(1)
            .then(() => {
                done.fail('Debería haber lanzado una excepción')
            })
            .catch(error => {
                expect(error).toBe(mockError)
                
                expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
                expect(rutasRepositoryMock.consultarRutaActivaEquipo).toHaveBeenCalledWith(1, 'Medellín')
                expect(enviosDomainServiceMock.consultarEnviosOptimizacion).toHaveBeenCalledWith(mockEquipo.ruta_activa)
                expect(estrategiaFactoryMock.crearEstrategiaOptima).toHaveBeenCalled()
                expect(ordenadorRutasMock.setStrategy).toHaveBeenCalledWith(estrategiaMock)
                expect(ordenadorRutasMock.ordenarEnvios).toHaveBeenCalled()
                expect(publisher).not.toHaveBeenCalled()
                done()
            })
    })

    it('debe incluir correctamente el id_evento en la llamada al publisher', async () => {
        const mockEventosInesperadosConId = {
            id_evento: 567,
            tipo: 'Accidente de tránsito',
            latitud: 6.25,
            longitud: -75.56,
            radio_afectacion_km: 0.7,
            descripcion: 'Accidente con múltiples vehículos'
        };
        
        condicionesDomainServiceMock.consultarEventosInesperados.mockResolvedValue(mockEventosInesperadosConId);
        
        await replanificarRutasUseCase.execute(1);
        
        expect(publisher).toHaveBeenCalledWith(
            expect.objectContaining({
                envios: mockEnvios,
                idEquipo: 1,
                idOptimizacionAnterior: mockEquipo.ruta_activa,
                idEvento: 567
            }),
            'esteban-replanificacion-ruta'
        );
    });
    
    it('debe manejar correctamente cuando eventosInesperados es null', async () => {
        condicionesDomainServiceMock.consultarEventosInesperados.mockResolvedValue(null);
        
        await replanificarRutasUseCase.execute(1);
        
        expect(publisher).toHaveBeenCalledWith(
            expect.objectContaining({
                envios: mockEnvios,
                idEquipo: 1,
                idOptimizacionAnterior: mockEquipo.ruta_activa,
                idEvento: undefined
            }),
            'esteban-replanificacion-ruta'
        );
    });
    
    it('debe manejar correctamente cuando eventosInesperados no tiene id_evento', async () => {
        const mockEventosSinId = {
            tipo: 'Lluvia intensa',
            latitud: 6.25,
            longitud: -75.56,
            radio_afectacion_km: 1.2,
            descripcion: 'Lluvia intensa en la zona norte'
        };
        
        condicionesDomainServiceMock.consultarEventosInesperados.mockResolvedValue(mockEventosSinId);
        
        await replanificarRutasUseCase.execute(1);
        
        expect(publisher).toHaveBeenCalledWith(
            expect.objectContaining({
                envios: mockEnvios,
                idEquipo: 1,
                idOptimizacionAnterior: mockEquipo.ruta_activa,
                idEvento: undefined
            }),
            'esteban-replanificacion-ruta'
        );
    });
    
})