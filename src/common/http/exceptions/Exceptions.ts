import { ErrorCode } from './ErrorCode'

export default abstract class Exception extends Error {
    isError: boolean

    message: string

    code: ErrorCode

    statusCode: number

    cause: string | null

    constructor(message: string, code: ErrorCode, statusCode: number, cause?: string) {
        super(message)
        this.isError = true
        this.message = message
        this.code = code
        this.statusCode = statusCode
        this.cause = cause || null
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
