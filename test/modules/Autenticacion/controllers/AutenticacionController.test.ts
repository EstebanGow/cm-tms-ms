import 'reflect-metadata'
import { Req, Status } from '@modules/shared/infrastructure';
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer';
import Result from '@common/http/Result';
import { validateData } from '@common/util/Schemas';
import AutenticacionController from '@modules/Autenticacion/controllers/AutenticacionController';
import AutenticacionUseCase from '@modules/Autenticacion/usecase/services/AutenticacionUseCase';
import IAutenticacionSchema from '@modules/Autenticacion/controllers/schemas/IAutenticacionSchema';


jest.mock('@common/dependencies/DependencyContainer');
jest.mock('@common/util/Schemas');

describe('AutenticacionController', () => {
  let autenticacionController: AutenticacionController;
  let mockAutenticacionUseCase: jest.Mocked<AutenticacionUseCase>;

  beforeEach(() => {
    mockAutenticacionUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<AutenticacionUseCase>;

    (DEPENDENCY_CONTAINER.get as jest.Mock).mockReturnValue(mockAutenticacionUseCase);
    (validateData as jest.Mock).mockImplementation((schema, data) => data);

    autenticacionController = new AutenticacionController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('autenticar', () => {
    it('debe validar los datos de entrada correctamente', async () => {
      const mockReq: Req = {
        data: {
          usuario: 'usuario',
          password: 'password'
        }
      } as Req;

      mockAutenticacionUseCase.execute.mockResolvedValue('token123');

      await autenticacionController.autenticar(mockReq);

      expect(validateData).toHaveBeenCalledWith(IAutenticacionSchema, mockReq.data);
    });

    it('debe ejecutar el caso de uso de autenticación', async () => {
      const mockReq: Req = {
        data: {
          usuario: 'usuario',
          password: 'password'
        }
      } as Req;

      mockAutenticacionUseCase.execute.mockResolvedValue('token123');

      await autenticacionController.autenticar(mockReq);

      expect(mockAutenticacionUseCase.execute).toHaveBeenCalledWith(mockReq.data);
    });

    it('debe retornar un resultado exitoso cuando la autenticación es correcta', async () => {
      const mockReq: Req = {
        data: {
          usuario: 'usuario',
          password: 'password'
        }
      } as Req;

      const expectedToken = 'token123';
      mockAutenticacionUseCase.execute.mockResolvedValue(expectedToken);

      const result = await autenticacionController.autenticar(mockReq);

      expect(result).toEqual(Result.ok<Status>({ ok: 'Autenticacion exitosa', token: expectedToken }));
    });

    it('debe propagar cualquier error que ocurra durante la autenticación', async () => {
      const mockReq: Req = {
        data: {
          usuario: 'usuario',
          password: 'password'
        }
      } as Req;

      const expectedError = new Error('Error de autenticación');
      mockAutenticacionUseCase.execute.mockRejectedValue(expectedError);

      await expect(autenticacionController.autenticar(mockReq)).rejects.toThrow(expectedError);
    });

    it('debe propagar cualquier error que ocurra durante la validación de datos', async () => {
      const mockReq: Req = {
        data: {
          usuario: 'usuario',
          password: 'password'
        }
      } as Req;

      const validationError = new Error('Error de validación');
      (validateData as jest.Mock).mockImplementation(() => {
        throw validationError;
      });

      await expect(autenticacionController.autenticar(mockReq)).rejects.toThrow(validationError);
    });
  });
});