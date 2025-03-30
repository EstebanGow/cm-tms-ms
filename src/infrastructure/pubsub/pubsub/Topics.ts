import ENV from '@common/envs/Envs'

const topicName = (topic: string): string => `projects/${ENV.PROJECT_ID}/topics/${topic}`

export const TOPIC_GUARDAR_PLANIFICACION = topicName('esteban-guardar-planificacion')
export const TOPIC_ACTUALIZAR_PLANIFICACION = topicName('esteban-guardar-replanificacion')
