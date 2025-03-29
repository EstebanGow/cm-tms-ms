import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import ENV from '@common/envs/Envs'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import { AxiosRepository } from '@common/http/repositories/AxiosRepository'
import { RedisRepository } from '@common/repositories'
import { IRespuestaApiGeolocalizacion } from '../models/IRespuestaApiGeolocalizacion'

export default class GeolocalizacionDomainService {
    private axiosService = DEPENDENCY_CONTAINER.get<AxiosRepository>(TYPESDEPENDENCIES.Axios)

    private redisRepository = DEPENDENCY_CONTAINER.get<RedisRepository>(TYPESDEPENDENCIES.RedisRepository)

    private readonly ERROR_CAUSA = 'Error al guardar evento'

    private readonly ERROR_COORDENADAS_CIUDAD = 'las coordenadas no pertenecen a la ciudad suministrada'

    private readonly ERROR_OBTENIER_DATOS = 'No se pudo obtener la geolocalizacion'

    async validarCoordenadasGeolocalizacion(
        latitud: number,
        longitud: number,
        ciudad: string,
    ): Promise<boolean | null> {
        const datosGeolocalizacion = await this.obtenerDatosGeolocalizacion(latitud, longitud)
        if (datosGeolocalizacion?.address.city?.includes(ciudad)) return true
        throw new BadMessageException(this.ERROR_CAUSA, this.ERROR_COORDENADAS_CIUDAD)
    }

    async obtenerDatosGeolocalizacion(latitud: number, longitud: number): Promise<IRespuestaApiGeolocalizacion | null> {
        const datosGeolocalizacionRedis = await this.obtenerGeolocalizacionRedis(latitud, longitud)
        if (datosGeolocalizacionRedis) return datosGeolocalizacionRedis
        const datosGeolocalizacionApi = await this.obtenerGeolocalizacionApi(latitud, longitud)
        await this.guardarGeolocalizacionRedis(latitud, longitud, datosGeolocalizacionApi)
        return datosGeolocalizacionApi
    }

    private async obtenerGeolocalizacionApi(latitud: number, longitud: number): Promise<IRespuestaApiGeolocalizacion> {
        const respuestaApi = await this.axiosService.getDataFromUrl(
            `${ENV.URL_SERVICIO_GEOLOCALIZACION}?lat=${latitud}&lon=${longitud}&format=json`,
        )
        if (!respuestaApi) throw new BadMessageException(this.ERROR_CAUSA, this.ERROR_OBTENIER_DATOS)
        return respuestaApi as unknown as IRespuestaApiGeolocalizacion
    }

    private async obtenerGeolocalizacionRedis(
        latitud: number,
        longitud: number,
    ): Promise<IRespuestaApiGeolocalizacion | null> {
        const respuestaRedis = await this.redisRepository.consultar(`geo-${latitud}-${longitud}`)
        return respuestaRedis as unknown as IRespuestaApiGeolocalizacion
    }

    async guardarGeolocalizacionRedis(latitud: number, longitud: number, datosGeolocalizacion: object): Promise<void> {
        await this.redisRepository.guardar(datosGeolocalizacion, `geo-${latitud}-${longitud}`)
    }
}
