import { IAutenticacionUsuario } from '../models/IAutenticacionUsuario'

export default class UsuarioAutenticacionEntity {
    usuario: string

    clave: string

    estado: string

    constructor(data: IAutenticacionUsuario) {
        this.usuario = data.usuario
        this.clave = data.clave
        this.estado = data.estado
    }
}
