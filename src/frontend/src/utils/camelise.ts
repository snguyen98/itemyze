import * as changeCase from 'change-case'

export const camelise = <T>(data: Record<string, any>): T => {
  return Object.keys(data).reduce((acc: Record<string, any>, key: string) => {
    acc[changeCase.camelCase(key)] = data[key]
    return acc
  }, {}) as T
}
