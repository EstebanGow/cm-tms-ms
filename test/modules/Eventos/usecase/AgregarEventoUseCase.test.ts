import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer';
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository';
import validarCoordenadas from '@common/util/CoordenadasUtil';
import BadMessageException from '@common/http/exceptions/BadMessageException';
import AgregarEventoUseCase from '@modules/Eventos/usecase/services/AgregarEventoUseCase';
import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in';
import GeolocalizacionDomainService from '@modules/Eventos/domain/services/GeolocalizacionDomainService';
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies';

jest.mock('@common/dependencies/DependencyContainer');
jest.mock('@common/util/CoordenadasUtil');

describe('AgregarEventoUseCase', () => {
  let agregarEventoUseCase: AgregarEventoUseCase;
  let mockEventosRepository: EventosRepository;
  let mockGeolocalizacionDomainService: GeolocalizacionDomainService;

  beforeEach(() => {
    mockEventosRepository = {
      registrarEvento: jest.fn(),
      consultarTipoEvento: jest.fn()
    } as unknown as EventosRepository;

    mockGeolocalizacionDomainService = {
      validarCoordenadasGeolocalizacion: jest.fn()
    } as unknown as GeolocalizacionDomainService;

    (DEPENDENCY_CONTAINER.get as jest.Mock).mockImplementation((type) => {
      if (type === TYPESDEPENDENCIES.EventosRepository) {
        return mockEventosRepository;
      }
      if (type === TYPESDEPENDENCIES.GeolocalizacionDomainService) {
        return mockGeolocalizacionDomainService;
      }
      return null;
    });
    
    agregarEventoUseCase = new AgregarEventoUseCase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockData: IRegistrarEventoIn = {
      idTipoEvento: 1,
      latitud: 40.7128,
      longitud: -74.0060,
      radioAfectacionKm: 100,
      descripcion: 'Evento de prueba',
      ciudad: 'Nueva York'
    };

    test('debería registrar un evento correctamente', async () => {
      (validarCoordenadas as jest.Mock).mockReturnValue(true);
      (mockGeolocalizacionDomainService.validarCoordenadasGeolocalizacion as jest.Mock).mockResolvedValue(true);
      (mockEventosRepository.consultarTipoEvento as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Tipo de evento' });

      await expect(agregarEventoUseCase.execute(mockData)).resolves.not.toThrow();

      expect(validarCoordenadas).toHaveBeenCalledWith(mockData.latitud, mockData.longitud);
      expect(mockGeolocalizacionDomainService.validarCoordenadasGeolocalizacion).toHaveBeenCalledWith(
        mockData.latitud,
        mockData.longitud,
        mockData.ciudad
      );
      expect(mockEventosRepository.consultarTipoEvento).toHaveBeenCalledWith(mockData.idTipoEvento);
      expect(mockEventosRepository.registrarEvento).toHaveBeenCalledWith(mockData);
    });


    test('debería lanzar error cuando la validación de geolocalizacion falla', async () => {
      (validarCoordenadas as jest.Mock).mockReturnValue(true);
      (mockGeolocalizacionDomainService.validarCoordenadasGeolocalizacion as jest.Mock).mockRejectedValue(
        new BadMessageException('Error de geolocalización', 'Las coordenadas no corresponden con la ciudad especificada')
      );

      await expect(agregarEventoUseCase.execute(mockData)).rejects.toThrowError(BadMessageException);
      await expect(agregarEventoUseCase.execute(mockData)).rejects.toThrow('Las coordenadas no corresponden con la ciudad especificada');

      expect(validarCoordenadas).toHaveBeenCalledWith(mockData.latitud, mockData.longitud);
      expect(mockGeolocalizacionDomainService.validarCoordenadasGeolocalizacion).toHaveBeenCalledWith(
        mockData.latitud,
        mockData.longitud,
        mockData.ciudad
      );
      expect(mockEventosRepository.consultarTipoEvento).not.toHaveBeenCalled();
      expect(mockEventosRepository.registrarEvento).not.toHaveBeenCalled();
    });

    test('debería lanzar error cuando el tipo de evento no existe', async () => {
      (validarCoordenadas as jest.Mock).mockReturnValue(true);
      (mockGeolocalizacionDomainService.validarCoordenadasGeolocalizacion as jest.Mock).mockResolvedValue(true);
      (mockEventosRepository.consultarTipoEvento as jest.Mock).mockResolvedValue(null);

      await expect(agregarEventoUseCase.execute(mockData)).rejects.toThrowError(BadMessageException);
      await expect(agregarEventoUseCase.execute(mockData)).rejects.toThrow('El tipo de evento no existe');

      expect(validarCoordenadas).toHaveBeenCalledWith(mockData.latitud, mockData.longitud);
      expect(mockGeolocalizacionDomainService.validarCoordenadasGeolocalizacion).toHaveBeenCalledWith(
        mockData.latitud,
        mockData.longitud,
        mockData.ciudad
      );
      expect(mockEventosRepository.consultarTipoEvento).toHaveBeenCalledWith(mockData.idTipoEvento);
      expect(mockEventosRepository.registrarEvento).not.toHaveBeenCalled();
    });
  });

  describe('validartipoEvento', () => {
    test('debería validar que el tipo de evento existe', async () => {
      (mockEventosRepository.consultarTipoEvento as jest.Mock).mockResolvedValue({ id: 1, nombre: 'Tipo de evento' });
      
      await expect(agregarEventoUseCase['validartipoEvento'](1)).resolves.not.toThrow();
      
      expect(mockEventosRepository.consultarTipoEvento).toHaveBeenCalledWith(1);
    });

    test('debería lanzar error cuando el tipo de evento no existe', async () => {
      (mockEventosRepository.consultarTipoEvento as jest.Mock).mockResolvedValue(null);
      
      await expect(agregarEventoUseCase['validartipoEvento'](1)).rejects.toThrowError(BadMessageException);
      await expect(agregarEventoUseCase['validartipoEvento'](1)).rejects.toThrow('El tipo de evento no existe');
      
      expect(mockEventosRepository.consultarTipoEvento).toHaveBeenCalledWith(1);
    });
  });
});