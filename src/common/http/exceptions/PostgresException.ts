import { ErrorCode, StatusCode } from './ErrorCode'
import Exception from './Exceptions'

export default class PostgresException extends Exception {
    constructor(_code: number | string | undefined, message: string) {
        const fsError = ErrorCode.REPOSITORY_ERROR
        super(message, ErrorCode.POSTGRES_ERROR, StatusCode.INTERNAL_ERROR, fsError)
    }
}
