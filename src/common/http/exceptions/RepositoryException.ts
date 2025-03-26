import { ErrorCode, StatusCode } from './ErrorCode'
import Exception from './Exceptions'

export default class RepositoryException extends Exception {
    constructor() {
        const message = 'Ocurrió un error al momento de guardar la guía'
        super(message, ErrorCode.REPOSITORY_ERROR, StatusCode.INTERNAL_ERROR)
    }
}
