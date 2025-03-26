import Joi from 'joi'

const messages = {
    'any.required': '{{#label}} es requerido.',
    'string.base': '{{#label}} debe ser un texto.',
    'string.empty': '{{#label}} es requerido.',
    'string.email': '{{#label}} debe ser un correo electrónico válido.',
    'string.min': '{{#label}} debe tener al menos {{#limit}} caracteres.',
    'number.base': '{{#label}} debe ser un número.',
    'number.min': '{{#label}} debe ser mayor o igual a {{#limit}}.',
    'array.base': '{{#label}} debe ser un arreglo.',
    'boolean.base': '{{#label}} debe ser verdadero o falso.',
}

const CustomJoi = Joi.defaults((schema) => {
    return schema.options({ messages })
})

export default CustomJoi
