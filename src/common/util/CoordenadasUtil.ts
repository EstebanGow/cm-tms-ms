export function validarCoordenadas(latitud: number, longitud: number) {
    if (latitud < -90 || latitud > 90) {
        return false
    }
    if (longitud < -180 || longitud > 180) {
        return false
    }
    return true
}

export default validarCoordenadas
