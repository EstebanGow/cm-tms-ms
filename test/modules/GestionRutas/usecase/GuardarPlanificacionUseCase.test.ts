import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'
import GuardarPlanificacionUseCase from '@modules/GestionRutas/usecase/services/GuardarPlanificacionUseCase'

jest.mock('@common/dependencies/DependencyContainer')

describe('GuardarPlanificacionUseCase', () => {
    let guardarPlanificacionUseCase: GuardarPlanificacionUseCase
    let rutasRepositoryMock: jest.Mocked<RutasRepository>
    
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
    
    beforeEach(() => {
        rutasRepositoryMock = {
            guardarRutas: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<RutasRepository>
        
        (DEPENDENCY_CONTAINER.get as jest.Mock).mockImplementation((type) => {
            if (type === TYPESDEPENDENCIESGLOBAL.RutasRepository) {
                return rutasRepositoryMock
            }
            return null
        })
        
        guardarPlanificacionUseCase = new GuardarPlanificacionUseCase()
    })
    
    afterEach(() => {
        jest.clearAllMocks()
    })
    
    it('debe guardar la planificación de rutas correctamente', async () => {
        const idEquipo = 1
        
        await guardarPlanificacionUseCase.execute(mockEnvios, idEquipo)
        
        expect(rutasRepositoryMock.guardarRutas).toHaveBeenCalledWith(mockEnvios, idEquipo)
        expect(rutasRepositoryMock.guardarRutas).toHaveBeenCalledTimes(1)
    })
    
    it('debe pasar un array vacío de envíos correctamente', async () => {
        const idEquipo = 1
        const enviosVacios: EnvioEntity[] = []
        
        await guardarPlanificacionUseCase.execute(enviosVacios, idEquipo)
        
        expect(rutasRepositoryMock.guardarRutas).toHaveBeenCalledWith(enviosVacios, idEquipo)
        expect(rutasRepositoryMock.guardarRutas).toHaveBeenCalledTimes(1)
    })
    
    it('debe pasar un ID de equipo inválido correctamente al repositorio', async () => {
        const idEquipoInvalido = -1
        
        await guardarPlanificacionUseCase.execute(mockEnvios, idEquipoInvalido)
        
        expect(rutasRepositoryMock.guardarRutas).toHaveBeenCalledWith(mockEnvios, idEquipoInvalido)
        expect(rutasRepositoryMock.guardarRutas).toHaveBeenCalledTimes(1)
    })
})