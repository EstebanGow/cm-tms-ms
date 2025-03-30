import 'reflect-metadata'
import { Req, Status } from '@modules/shared/infrastructure';
import { Response } from '@common/http/Response';
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer';
import Result from '@common/http/Result';
import { validateData } from '@common/util/Schemas';
import EquiposController from '@modules/Equipos/controllers/EquiposController';
import ConsultarRutasEquipoUseCase from '@modules/Equipos/usecase/services/ConsultarRutasEquipoUseCase';
import { IEquipoIn } from '@modules/Equipos/usecase/dto/in';
import IEquipoSchema from '@modules/Equipos/controllers/schemas/IEquiposSchema';

jest.mock('@common/dependencies/DependencyContainer');
jest.mock('@common/util/Schemas');
jest.mock('@modules/GestionRutas/controllers/schemas/IGestionRutasSchema', () => ({}));

describe('EquiposController', () => {
  let equiposController: EquiposController;
  let mockConsultarRutasEquipoUseCase: jest.Mocked<ConsultarRutasEquipoUseCase>;
  
  beforeEach(() => {
    mockConsultarRutasEquipoUseCase = {
      execute: jest.fn()
    } as unknown as jest.Mocked<ConsultarRutasEquipoUseCase>;
    
    DEPENDENCY_CONTAINER.get = jest.fn().mockReturnValue(mockConsultarRutasEquipoUseCase);
    
    equiposController = new EquiposController();
  });

  describe('consultarRutaEquipo', () => {
    const mockRequest = {
      data: {
        idEquipo: 12
      }
    } as Req;

    const mockValidatedData = {
      idEquipo: 12
    } as IEquipoIn;

    const mockServiceResponse = [
        {
            "id_optimizacion": 1,
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
        }
    ];

    it('debe usar el esquema correcto para validar los datos', async () => {
      (validateData as jest.Mock).mockReturnValue(mockValidatedData);
      mockConsultarRutasEquipoUseCase.execute.mockResolvedValue(mockServiceResponse);
      
      await equiposController.consultarRutaEquipo(mockRequest);
      
      expect(validateData).toHaveBeenCalledWith(IEquipoSchema, mockRequest.data);
    });

    it('debe validar los datos de la solicitud', async () => {
      (validateData as jest.Mock).mockReturnValue(mockValidatedData);
      mockConsultarRutasEquipoUseCase.execute.mockResolvedValue(mockServiceResponse);
      
      await equiposController.consultarRutaEquipo(mockRequest);
      
      expect(validateData).toHaveBeenCalledWith(expect.anything(), mockRequest.data);
    });

    it('debe ejecutar el caso de uso con los datos validados', async () => {
      (validateData as jest.Mock).mockReturnValue(mockValidatedData);
      mockConsultarRutasEquipoUseCase.execute.mockResolvedValue(mockServiceResponse);
      
      await equiposController.consultarRutaEquipo(mockRequest);
      
      expect(mockConsultarRutasEquipoUseCase.execute).toHaveBeenCalledWith(mockValidatedData);
    });

    it('debe retornar un resultado exitoso con los datos del servicio', async () => {
      (validateData as jest.Mock).mockReturnValue(mockValidatedData);
      mockConsultarRutasEquipoUseCase.execute.mockResolvedValue(mockServiceResponse);
      
      const result = await equiposController.consultarRutaEquipo(mockRequest);
      
      expect(result).toEqual(
        Result.ok<Status>({
          ok: 'Se consultaron las rutas del equipo de forma exitosa',
          data: mockServiceResponse
        })
      );
    });

    it('debe propagar errores desde la validación de datos', async () => {
      const validationError = new Error('Error de validación');
      (validateData as jest.Mock).mockImplementation(() => {
        throw validationError;
      });
      
      await expect(equiposController.consultarRutaEquipo(mockRequest)).rejects.toThrow(validationError);
    });

    it('debe propagar errores desde el caso de uso', async () => {
      const useCaseError = new Error('Error en el caso de uso');
      (validateData as jest.Mock).mockReturnValue(mockValidatedData);
      mockConsultarRutasEquipoUseCase.execute.mockRejectedValue(useCaseError);
      
      await expect(equiposController.consultarRutaEquipo(mockRequest)).rejects.toThrow(useCaseError);
    });
  });
});