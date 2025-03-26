import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer';
import { AutenticacionRepository } from '@modules/Autenticacion/domain/repositories/AutenticacionRepository';
import TYPESDEPENDENCIES from '@modules/Autenticacion/dependencies/TypesDependencies';
import TokenService from '@infrastructure/services/TokenService';
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies';
import UsuarioAutenticacionEntity from '@modules/Autenticacion/domain/entities/UsuarioAutenticacionEntity';
import CustomError from '@common/util/CustomError';
import AutenticacionUseCase from '@modules/Autenticacion/usecase/services/AutenticacionUseCase';
import { IAutenticacionIn } from '@modules/Autenticacion/usecase/dto/in';

jest.mock('@common/dependencies/DependencyContainer');

describe('AutenticacionUseCase', () => {
  let autenticacionUseCase: AutenticacionUseCase;
  let mockAutenticacionRepository: jest.Mocked<AutenticacionRepository>;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    mockAutenticacionRepository = {
      obtenerUsuario: jest.fn(),
    } as unknown as jest.Mocked<AutenticacionRepository>;

    mockTokenService = {
      generarToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    (DEPENDENCY_CONTAINER.get as jest.Mock).mockImplementation((type) => {
      if (type === TYPESDEPENDENCIES.AutenticacionRepository) {
        return mockAutenticacionRepository;
      }
      if (type === TYPESDEPENDENCIESGLOBAL.TokenService) {
        return mockTokenService;
      }
      return null;
    });

    autenticacionUseCase = new AutenticacionUseCase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debe validar al usuario y generar un token si el usuario existe', async () => {
      const mockData: IAutenticacionIn = {
        usuario: 'usuario',
        password: 'password'
      };

      const mockUsuario: UsuarioAutenticacionEntity = {
        id: 1,
        nombreUsuario: 'usuario',
        rol: 'admin'
      } as UsuarioAutenticacionEntity;

      const mockToken = 'token123';

      mockAutenticacionRepository.obtenerUsuario.mockResolvedValue(mockUsuario);
      mockTokenService.generarToken.mockReturnValue(mockToken);

      const result = await autenticacionUseCase.execute(mockData);

      expect(mockAutenticacionRepository.obtenerUsuario).toHaveBeenCalledWith(mockData);
      expect(mockTokenService.generarToken).toHaveBeenCalledWith(mockUsuario);
      expect(result).toBe(mockToken);
    });

    it('debe lanzar un error si el usuario no existe', async () => {
      const mockData: IAutenticacionIn = {
        usuario: 'usuario',
        password: 'password'
      };

      mockAutenticacionRepository.obtenerUsuario.mockResolvedValue(null);

      await expect(autenticacionUseCase.execute(mockData)).rejects.toThrow(
        new CustomError('Error de autenticacion', 401, true)
      );

      expect(mockAutenticacionRepository.obtenerUsuario).toHaveBeenCalledWith(mockData);
      expect(mockTokenService.generarToken).not.toHaveBeenCalled();
    });

    it('debe propagar cualquier error que ocurra durante la obtención del usuario', async () => {
      const mockData: IAutenticacionIn = {
        usuario: 'usuario',
        password: 'password'
      };

      const expectedError = new Error('Error en la base de datos');
      mockAutenticacionRepository.obtenerUsuario.mockRejectedValue(expectedError);

      await expect(autenticacionUseCase.execute(mockData)).rejects.toThrow(expectedError);
      expect(mockTokenService.generarToken).not.toHaveBeenCalled();
    });

    it('debe propagar cualquier error que ocurra durante la generación del token', async () => {
      const mockData: IAutenticacionIn = {
        usuario: 'usuario',
        password: 'password'
      };

      const mockUsuario: UsuarioAutenticacionEntity = {
        id: 1,
        nombreUsuario: 'usuario',
        rol: 'admin'
      } as UsuarioAutenticacionEntity;

      const expectedError = new Error('Error generando token');
      mockAutenticacionRepository.obtenerUsuario.mockResolvedValue(mockUsuario);
      mockTokenService.generarToken.mockImplementation(() => {
        throw expectedError;
      });

      await expect(autenticacionUseCase.execute(mockData)).rejects.toThrow(expectedError);
    });
  });

  describe('validarUsuario', () => {
    it('debe retornar el usuario si existe', async () => {
      const mockData: IAutenticacionIn = {
        usuario: 'usuario',
        password: 'password'
      };

      const mockUsuario: UsuarioAutenticacionEntity = {
        id: 1,
        nombreUsuario: 'usuario',
        rol: 'admin'
      } as UsuarioAutenticacionEntity;

      mockAutenticacionRepository.obtenerUsuario.mockResolvedValue(mockUsuario);

      const useCase = new AutenticacionUseCase();
      const validarUsuario = jest.spyOn(useCase as any, 'validarUsuario');

      await useCase.execute(mockData);

      expect(validarUsuario).toHaveBeenCalledWith(mockData);
      expect(mockAutenticacionRepository.obtenerUsuario).toHaveBeenCalledWith(mockData);
    });

    it('debe lanzar un error CustomError si el usuario no existe', async () => {
      const mockData: IAutenticacionIn = {
        usuario: 'usuario',
        password: 'password'
      };

      mockAutenticacionRepository.obtenerUsuario.mockResolvedValue(null);

      const useCase = new AutenticacionUseCase();
      const validarUsuario = jest.spyOn(useCase as any, 'validarUsuario');

      try {
        await useCase.execute(mockData);
        fail('Se esperaba que el método lanzara un error');
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe('Error de autenticacion');
        expect((error as CustomError).statusCode).toBe(401);
      }

      expect(validarUsuario).toHaveBeenCalledWith(mockData);
    });
  });
});