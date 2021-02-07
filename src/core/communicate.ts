import { browser } from 'webextension-polyfill-ts'
const runtime = browser && browser.runtime

import { uuid } from '../utils/string'

const handlerStorage: { [index: string]: storageStructure[] } = {}

runtime.onMessage.addListener((msg: runtimeMessage) => {
  if (!msg) {
    return
  }

  if (!msg.type) {
    throw new Error('Received wrong runtimeMessage structure.')
  }

  if (handlerStorage[msg.type]) {
    handlerStorage[msg.type].forEach(handler => {
      handler.func(msg.data)
    })
  }
})

interface storageStructure {
  uuid: string
  func: (...args: any[]) => void
}

export const addHook = (
  type: string,
  callback: (...args: any[]) => void
): string => {
  if (!handlerStorage[type]) {
    handlerStorage[type] = []
  }

  const id = uuid()

  handlerStorage[type].push({
    uuid: id,
    func: callback
  })

  return id
}

export const clearHook = (type: string, id: string): boolean => {
  if (!handlerStorage[type]) {
    return false
  }

  const len = handlerStorage[type].length
  let removed = false

  for (let i = 0; i < len; i++) {
    if (handlerStorage[type][i].uuid === id) {
      handlerStorage[type].splice(i, 1)

      removed = true
    }
  }

  return removed
}

export const sendMessage = (type: string, data: unknown): void => {
  runtime.postMessage({
    type,
    data
  })
}
