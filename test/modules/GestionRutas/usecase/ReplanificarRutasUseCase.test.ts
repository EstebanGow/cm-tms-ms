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

jest.mock('@common/dependencies/DependencyContainer')

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
    
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {})
        
        estrategiaMock = {
            ordenar: jest.fn().mockReturnValue([...mockEnvios])
        }
        
        rutasRepositoryMock = {
            guardarRutasReplanificacion: jest.fn().mockResolvedValue(undefined)
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
                
                expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
                    mockEnvios, 
                    1, 
                    mockEquipo.ruta_activa
                )
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
        
        expect(rutasRepositoryMock.guardarRutasReplanificacion).toHaveBeenCalledWith(
            mockEnvios, 
            1, 
            mockEquipo.ruta_activa
        )
    })
})