import Joi from 'joi'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import { decode } from './Buffer'
import { PubSubPayload, pubSubSchema } from '../../infrastructure/app/schemas'
import parse from './JSON'

type Schema = Joi.ObjectSchema | Joi.ArraySchema
type Body = Record<string, unknown> | undefined | unknown

export const validateData = <T>(schema: Schema, dataToValidate: Body): T => {
    if (dataToValidate) {
        const { error, value } = schema.validate(dataToValidate, { convert: true })
        if (error) {
            throw new BadMessageException(error.message, 'Los valores de entrada no son correctos.')
        }
        return value
    }
    throw new Error('mensaje xxxxxxxx')
}

export const validatePubSub = (dataToValidate: Body): PubSubPayload | null | undefined => {
    if (dataToValidate) {
        const { error, value } = pubSubSchema.validate(dataToValidate, {
            convert: true,
        })
        if (!error) return value
    }
    return null
}

export const validateDataPubSub = <T>(schema: Schema, dataToValidate: Body): T => {
    const pubSubPayload = validatePubSub(dataToValidate)
    if (pubSubPayload) {
        const decodeMessage = parse(decode(pubSubPayload.message.data))
        const { error, value } = schema.validate(decodeMessage, { convert: true })

        if (error) {
            throw new BadMessageException(error.message, 'error validando data de entrada')
        }

        return value
    }
    throw new BadMessageException('no se encontró data de pubsub', 'error validando data de entrada')
}
