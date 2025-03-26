import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer';
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository';
import validarCoordenadas from '@common/util/CoordenadasUtil';
import BadMessageException from '@common/http/exceptions/BadMessageException';
import AgregarEventoUseCase from '@modules/Eventos/usecase/services/AgregarEventoUseCase';
import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in';

jest.mock('@common/dependencies/DependencyContainer');
jest.mock('@common/util/CoordenadasUtil');

describe('AgregarEventoUseCase', () => {
  let agregarEventoUseCase: AgregarEventoUseCase;
  let mockEventosRepository: EventosRepository;

  beforeEach(() => {
    mockEventosRepository = {
      registrarEvento: jest.fn(),
      consultarTipoEvento: jest.fn()
    } as unknown as EventosRepository;

    (DEPENDENCY_CONTAINER.get as jest.Mock).mockReturnValue(mockEventosRepository);
    
    agregarEventoUseCase = new AgregarEventoUseCase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockData: IRegistrarEventoIn = {
      id_tipo_evento: 1,
      latitud: 40.7128,
      longitud: -74.0060,
      radio_afectacion_km: 100,
      descripcion: 'Evento de prueba'
    };

    test('debería registrar un evento correctamente', async () => {
      (validarCoordenadas as jest.Mock).mockReturnValue(true);
      (mockEventosRepository.consultarTipoEvento as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Tipo de evento' });

      await expect(agregarEventoUseCase.execute(mockData)).resolves.not.toThrow();

      expect(validarCoordenadas).toHaveBeenCalledWith(mockData.latitud, mockData.longitud);
      expect(mockEventosRepository.consultarTipoEvento).toHaveBeenCalledWith(mockData.id_tipo_evento);
      expect(mockEventosRepository.registrarEvento).toHaveBeenCalledWith(mockData);
    });

    test('debería lanzar error cuando las coordenadas son inválidas', async () => {
      (validarCoordenadas as jest.Mock).mockReturnValue(false);

      await expect(agregarEventoUseCase.execute(mockData)).rejects.toThrowError(BadMessageException);
      await expect(agregarEventoUseCase.execute(mockData)).rejects.toThrow('Las coordenadas suministradas no son correctas');

      expect(validarCoordenadas).toHaveBeenCalledWith(mockData.latitud, mockData.longitud);
      expect(mockEventosRepository.consultarTipoEvento).not.toHaveBeenCalled();
      expect(mockEventosRepository.registrarEvento).not.toHaveBeenCalled();
    });

    test('debería lanzar error cuando el tipo de evento no existe', async () => {
      (validarCoordenadas as jest.Mock).mockReturnValue(true);
      (mockEventosRepository.consultarTipoEvento as jest.Mock).mockResolvedValue(null);

      await expect(agregarEventoUseCase.execute(mockData)).rejects.toThrowError(BadMessageException);
      await expect(agregarEventoUseCase.execute(mockData)).rejects.toThrow('El tipo de evento no existe');

      expect(validarCoordenadas).toHaveBeenCalledWith(mockData.latitud, mockData.longitud);
      expect(mockEventosRepository.consultarTipoEvento).toHaveBeenCalledWith(mockData.id_tipo_evento);
      expect(mockEventosRepository.registrarEvento).not.toHaveBeenCalled();
    });
  });

  describe('consultarTiposEvento', () => {
    test('debería validar que el tipo de evento existe', async () => {
      (mockEventosRepository.consultarTipoEvento as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Tipo de evento' });
      
      await expect(agregarEventoUseCase['consultarTiposEvento'](1)).resolves.not.toThrow();
      
      expect(mockEventosRepository.consultarTipoEvento).toHaveBeenCalledWith(1);
    });

    test('debería lanzar error cuando el tipo de evento no existe', async () => {
      (mockEventosRepository.consultarTipoEvento as jest.Mock).mockResolvedValue(null);
      
      await expect(agregarEventoUseCase['consultarTiposEvento'](1)).rejects.toThrowError(BadMessageException);
      await expect(agregarEventoUseCase['consultarTiposEvento'](1)).rejects.toThrow('El tipo de evento no existe');
      
      expect(mockEventosRepository.consultarTipoEvento).toHaveBeenCalledWith(1);
    });
  });
});