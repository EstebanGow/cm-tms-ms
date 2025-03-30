import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import EquiposDomainService from '@modules/GestionRutas/domain/services/Equipos/EquiposDomainService'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import EnviosDomainService from '@modules/GestionRutas/domain/services/Envios/EnviosDomainService'
import EstadoEnvios from '@common/enum/EstadoEnvios'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import CondicionesDomainService from '@modules/GestionRutas/domain/services/Condiciones/CondicionesDomainService'
import EstrategiaFactory from '@modules/GestionRutas/domain/strategies/EstrategiaFactory'
import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'
import OrdenadorRutas from '@modules/GestionRutas/domain/strategies/OrdenadorRutas'
import EquipoEntity from '@modules/GestionRutas/domain/entities/EquipoEntity'
import PlanificarRutasUseCase from '@modules/GestionRutas/usecase/services/PlanificarRutasUseCase'
import { publisher } from '@infrastructure/app/events/pubsub/PubSubBatch'



jest.mock('@common/dependencies/DependencyContainer')

jest.mock('@infrastructure/app/events/pubsub/PubSubBatch', () => ({
    publisher: jest.fn().mockResolvedValue(undefined)
}))


describe('PlanificarRutasUseCase', () => {
    let planificarRutasUseCase: PlanificarRutasUseCase
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
    
    const mockCondiciones = {
        clima: 'Soleado',
        trafico: 'Bajo',
        eventosInesperados: []
    }
    
    beforeEach(() => {
        estrategiaMock = {
            ordenar: jest.fn().mockReturnValue([...mockEnvios])
        }
        
        rutasRepositoryMock = {
            guardarRutas: jest.fn()
        } as unknown as jest.Mocked<RutasRepository>
        
        equiposDomainServiceMock = {
            consultarEquipo: jest.fn(),
            validarEquipo: jest.fn()
        } as unknown as jest.Mocked<EquiposDomainService>
        
        enviosDomainServiceMock = {
            consultarEnvios: jest.fn(),
            ordenarEnviosPorPrioridad: jest.fn(),
            seleccionarEnviosPorCapacidad: jest.fn()
        } as unknown as jest.Mocked<EnviosDomainService>
        
        condicionesDomainServiceMock = {
            consultarClima: jest.fn(),
            consultarTrafico: jest.fn(),
            consultarEventosInesperados: jest.fn()
        } as unknown as jest.Mocked<CondicionesDomainService>
        
        estrategiaFactoryMock = {
            crearEstrategiaOptima: jest.fn()
        } as unknown as jest.Mocked<EstrategiaFactory>
        
        ordenadorRutasMock = {
            setStrategy: jest.fn(),
            ordenarEnvios: jest.fn()
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
        
        planificarRutasUseCase = new PlanificarRutasUseCase()
    })
    
    afterEach(() => {
        jest.clearAllMocks()
    })
    
    it('debe planificar rutas correctamente', async () => {
        equiposDomainServiceMock.consultarEquipo.mockResolvedValue(mockEquipo)
        enviosDomainServiceMock.consultarEnvios.mockResolvedValue(mockEnvios)
        enviosDomainServiceMock.ordenarEnviosPorPrioridad.mockReturnValue(mockEnvios)
        enviosDomainServiceMock.seleccionarEnviosPorCapacidad.mockReturnValue(mockEnvios)
        
        condicionesDomainServiceMock.consultarClima.mockResolvedValue(mockCondiciones.clima)
        condicionesDomainServiceMock.consultarTrafico.mockResolvedValue(mockCondiciones.trafico)
        condicionesDomainServiceMock.consultarEventosInesperados.mockResolvedValue(mockCondiciones.eventosInesperados)
        
        estrategiaFactoryMock.crearEstrategiaOptima.mockReturnValue(estrategiaMock)
        ordenadorRutasMock.ordenarEnvios.mockReturnValue(mockEnvios)
        
        const resultado = await planificarRutasUseCase.execute(1)
        
        expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
        expect(equiposDomainServiceMock.validarEquipo).toHaveBeenCalledWith(mockEquipo)
        expect(enviosDomainServiceMock.consultarEnvios).toHaveBeenCalledWith(EstadoEnvios.Pendiente, 'Medellín')
        expect(enviosDomainServiceMock.ordenarEnviosPorPrioridad).toHaveBeenCalledWith(mockEnvios)
        expect(enviosDomainServiceMock.seleccionarEnviosPorCapacidad).toHaveBeenCalledWith(mockEnvios, mockEquipo.vehiculo)
        
        expect(condicionesDomainServiceMock.consultarClima).toHaveBeenCalledWith('Medellín')
        expect(condicionesDomainServiceMock.consultarTrafico).toHaveBeenCalledWith('Medellín')
        expect(condicionesDomainServiceMock.consultarEventosInesperados).toHaveBeenCalledWith('Medellín')
        
        expect(estrategiaFactoryMock.crearEstrategiaOptima).toHaveBeenCalledWith(
            mockCondiciones.clima,
            mockCondiciones.trafico,
            mockCondiciones.eventosInesperados
        )
        
        expect(ordenadorRutasMock.setStrategy).toHaveBeenCalledWith(estrategiaMock)
        expect(ordenadorRutasMock.ordenarEnvios).toHaveBeenCalledWith(
            mockEnvios,
            mockCondiciones.clima,
            mockCondiciones.trafico,
            mockCondiciones.eventosInesperados
        )
        expect(publisher).toHaveBeenCalledWith(mockEnvios, 'esteban-replanificacion-ruta')
        expect(rutasRepositoryMock.guardarRutas).toHaveBeenCalledWith(mockEnvios, 1)
        expect(resultado).toEqual(mockEnvios)
    })
    
    it('debe lanzar error cuando el equipo no existe', async () => {
        equiposDomainServiceMock.consultarEquipo.mockResolvedValue(null)
        
        try {
            await planificarRutasUseCase.execute(1)
            fail('Debería haber lanzado una excepción')
        } catch (error) {
            expect(error).toBeInstanceOf(BadMessageException)
            expect((error as BadMessageException).message).toContain('El equipo solicitado no existe')
        }
        
        expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
        expect(equiposDomainServiceMock.validarEquipo).not.toHaveBeenCalled()
        expect(enviosDomainServiceMock.consultarEnvios).not.toHaveBeenCalled()
    })
    
    it('debe lanzar error cuando el equipo no es válido', async () => {
        const mockError = new BadMessageException('Error de validación', 'El equipo no está activo')
        
        equiposDomainServiceMock.consultarEquipo.mockResolvedValue(mockEquipo)
        equiposDomainServiceMock.validarEquipo.mockImplementation(() => {
            throw mockError
        })
        
        try {
            await planificarRutasUseCase.execute(1)
            fail('Debería haber lanzado una excepción')
        } catch (error) {
            expect(error).toBe(mockError)
        }
        
        expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
        expect(equiposDomainServiceMock.validarEquipo).toHaveBeenCalledWith(mockEquipo)
        expect(enviosDomainServiceMock.consultarEnvios).not.toHaveBeenCalled()
    })
    
    it('debe lanzar error cuando no hay envíos disponibles', async () => {
        equiposDomainServiceMock.consultarEquipo.mockResolvedValue(mockEquipo)
        enviosDomainServiceMock.consultarEnvios.mockResolvedValue([])
        enviosDomainServiceMock.ordenarEnviosPorPrioridad.mockReturnValue([])
        enviosDomainServiceMock.seleccionarEnviosPorCapacidad.mockReturnValue([])
        
        try {
            await planificarRutasUseCase.execute(1)
            fail('Debería haber lanzado una excepción')
        } catch (error) {
            expect(error).toBeInstanceOf(BadMessageException)
            expect((error as BadMessageException).message).toContain('No hay envíos disponibles')
        }
        
        expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
        expect(equiposDomainServiceMock.validarEquipo).toHaveBeenCalledWith(mockEquipo)
        expect(enviosDomainServiceMock.consultarEnvios).toHaveBeenCalledWith(EstadoEnvios.Pendiente, 'Medellín')
        expect(enviosDomainServiceMock.ordenarEnviosPorPrioridad).toHaveBeenCalledWith([])
        expect(enviosDomainServiceMock.seleccionarEnviosPorCapacidad).toHaveBeenCalledWith([], mockEquipo.vehiculo)
        expect(condicionesDomainServiceMock.consultarClima).not.toHaveBeenCalled()
    })
    
    it('debe manejar errores en la consulta de condiciones', async () => {
        const mockError = new Error('Error al consultar clima')
        
        equiposDomainServiceMock.consultarEquipo.mockResolvedValue(mockEquipo)
        enviosDomainServiceMock.consultarEnvios.mockResolvedValue(mockEnvios)
        enviosDomainServiceMock.ordenarEnviosPorPrioridad.mockReturnValue(mockEnvios)
        enviosDomainServiceMock.seleccionarEnviosPorCapacidad.mockReturnValue(mockEnvios)
        
        condicionesDomainServiceMock.consultarClima.mockRejectedValue(mockError)
        
        try {
            await planificarRutasUseCase.execute(1)
            fail('Debería haber lanzado una excepción')
        } catch (error) {
            expect(error).toBe(mockError)
        }
        
        expect(equiposDomainServiceMock.consultarEquipo).toHaveBeenCalledWith(1)
        expect(enviosDomainServiceMock.consultarEnvios).toHaveBeenCalledWith(EstadoEnvios.Pendiente, 'Medellín')
        expect(condicionesDomainServiceMock.consultarClima).toHaveBeenCalledWith('Medellín')
        expect(rutasRepositoryMock.guardarRutas).not.toHaveBeenCalled()
    })
})