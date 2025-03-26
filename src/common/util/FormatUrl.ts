const formatUrl = (nombre: string): string => {
    return nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9ñ]+/g, '-')
        .replace(/^(-)|(-)$|(-)(?=-)/g, '')
}

export default formatUrl
