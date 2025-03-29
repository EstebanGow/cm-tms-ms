import BadMessageException from '@common/http/exceptions/BadMessageException'

export function validarCoordenadas(latitud: number, longitud: number) {
    try {
        if (latitud < -90 || latitud > 90) {
            throw new Error('Las coordenadas suministradas no son correctas')
        }
        if (longitud < -180 || longitud > 180) {
            throw new Error('Las coordenadas suministradas no son correctas')
        }
    } catch (error) {
        throw new BadMessageException('Error al guardar evento', error.message)
    }
}

export default validarCoordenadas
