import 'reflect-metadata'
import { Req } from '@modules/shared/infrastructure';
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer';
import Result from '@common/http/Result';
import { validateData } from '@common/util/Schemas';
import BadMessageException from '@common/http/exceptions/BadMessageException';
import EventosController from '@modules/Eventos/controllers/EventosController';
import AgregarEventoUseCase from '@modules/Eventos/usecase/services/AgregarEventoUseCase';
import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in';

jest.mock('@common/dependencies/DependencyContainer');
jest.mock('@common/util/Schemas');

describe('EventosController', () => {
  let eventosController: EventosController;
  let mockAgregarEventoUseCase: jest.Mocked<AgregarEventoUseCase>;

  beforeEach(() => {
    mockAgregarEventoUseCase = {
      execute: jest.fn()
    } as unknown as jest.Mocked<AgregarEventoUseCase>;

    (DEPENDENCY_CONTAINER.get as jest.Mock).mockReturnValue(mockAgregarEventoUseCase);
    
    eventosController = new EventosController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarEvento', () => {
    const mockReq: Req = {
      data: {
        id_tipo_evento: 1,
        latitud: 40.7128,
        longitud: -74.0060
      }
    } as Req;

    const mockDataValidada: IRegistrarEventoIn = {
      id_tipo_evento: 1,
      latitud: 40.7128,
      longitud: -74.0060,
      radio_afectacion_km: 10,
      descripcion: 'Accidente'
    };

    test('debería registrar un evento exitosamente', async () => {
      (validateData as jest.Mock).mockReturnValue(mockDataValidada);
      mockAgregarEventoUseCase.execute.mockResolvedValue(undefined);

      const result = await eventosController.registrarEvento(mockReq);

      expect(validateData).toHaveBeenCalledWith(expect.anything(), mockReq.data);
      expect(mockAgregarEventoUseCase.execute).toHaveBeenCalledWith(mockDataValidada);
      expect(result).toEqual(Result.ok({ ok: 'Se registro el evento de forma exitosa' }));
    });

    test('debería manejar error cuando la validación falla', async () => {
      const errorValidacion = new BadMessageException('Error de validación', 'Los datos no son válidos');
      (validateData as jest.Mock).mockImplementation(() => {
        throw errorValidacion;
      });

      await expect(eventosController.registrarEvento(mockReq)).rejects.toThrow(errorValidacion);
      
      expect(validateData).toHaveBeenCalledWith(expect.anything(), mockReq.data);
      expect(mockAgregarEventoUseCase.execute).not.toHaveBeenCalled();
    });

    test('debería manejar error cuando el caso de uso falla', async () => {
      const errorCasoUso = new BadMessageException('Error al guardar evento', 'El tipo de evento no existe');
      (validateData as jest.Mock).mockReturnValue(mockDataValidada);
      mockAgregarEventoUseCase.execute.mockRejectedValue(errorCasoUso);

      await expect(eventosController.registrarEvento(mockReq)).rejects.toThrow(errorCasoUso);
      
      expect(validateData).toHaveBeenCalledWith(expect.anything(), mockReq.data);
      expect(mockAgregarEventoUseCase.execute).toHaveBeenCalledWith(mockDataValidada);
    });
  });
});