import * as store from '../utils/store'
import { eventBus } from './eventbus'
import log from '../utils/logger'

const runtime = (chrome && chrome.runtime) || (browser && browser.runtime)

const BLOCK_NAMESPACE = '__REFRESHER_BLOCK'

const BLOCK_TYPES = {
  NICK: 'NICK',
  ID: 'ID',
  IP: 'IP',
  TEXT: 'TEXT',
  DCCON: 'DCCON'
}

export const TYPE_NAMES = {
  NICK: '닉네임',
  ID: '아이디',
  IP: 'IP',
  TEXT: '내용',
  DCCON: '디시콘'
}

const BLOCK_TYPES_KEYS = Object.keys(BLOCK_TYPES)

const BLOCK_DETECT_MODE = {
  SAME: 'SAME',
  CONTAIN: 'CONTAIN',
  NOT_SAME: 'NOT_SAME',
  NOT_CONTAIN: 'NOT_CONTAIN'
}

const BLOCK_DETECT_MODE_KEYS = Object.keys(BLOCK_DETECT_MODE)

interface RefresherBlockValue {
  content: string
  isRegex: boolean
  gallery?: string
  extra?: string
}

let BLOCK_CACHE: { [index: string]: RefresherBlockValue[] } = {}
let BLOCK_MODE_CACHE: { [index: string]: string } = {}

BLOCK_TYPES_KEYS.forEach(async key => {
  const keyCache = await store.get(`${BLOCK_NAMESPACE}:${key}`)
  const modeCache = await store.get(`${BLOCK_NAMESPACE}:${key}:MODE`)

  BLOCK_CACHE[key] = keyCache || []
  BLOCK_MODE_CACHE[key] = modeCache || BLOCK_DETECT_MODE.SAME

  if (!modeCache) {
    await store.set(`${BLOCK_NAMESPACE}:${key}:MODE`, BLOCK_DETECT_MODE.SAME)
  }

  SendToBackground()
})

const SendToBackground = () => {
  runtime.sendMessage(
    JSON.stringify({
      blocks_store: BLOCK_CACHE,
      blockModes_store: BLOCK_MODE_CACHE
    })
  )
}

const checkValidType = (type: string) => {
  return BLOCK_TYPES_KEYS.filter(key => type === key).length > 0
}

const checkValidMode = (mode: string) => {
  return Object.keys(BLOCK_DETECT_MODE).filter(key => mode === key).length > 0
}

const removeExists = (type: string, content: string) => {
  const cache = BLOCK_CACHE[type]

  for (let i = 0; i < cache.length; i++) {
    if (cache[i].content === content) {
      BLOCK_CACHE[type].splice(i, 1)
    }
  }
}

const InternalAddToList = (
  type: string,
  content: string,
  isRegex: boolean,
  gallery?: string,
  extra?: string
) => {
  removeExists(type, content)

  BLOCK_CACHE[type].push({
    content,
    isRegex,
    gallery,
    extra
  })

  store.set(`${BLOCK_NAMESPACE}:${type}`, BLOCK_CACHE[type])
}

const InternalUpdateMode = (type: string, mode: string) => {
  BLOCK_MODE_CACHE[type] = mode

  store.set(`${BLOCK_NAMESPACE}:${type}:MODE`, mode)
}

/**
 * 차단 목록에 추가합니다.
 *
 * @param type 차단 종류
 * @param content 차단 내용
 * @param isRegex 정규식인지에 대한 여부
 * @param gallery 특정 갤러리에만 해당하면 갤러리의 ID 값
 * @param extra 차단 목록에서의 식별을 위한 추가 값
 */
export const add = (
  type: string,
  content: string,
  isRegex: boolean,
  gallery?: string,
  extra?: string
): void => {
  if (!checkValidType(type)) {
    throw new Error(
      `${type} is not a valid type. requires one of [${BLOCK_TYPES_KEYS.join(
        ', '
      )}]`
    )
  }

  InternalAddToList(type, content, isRegex, gallery, extra)

  try {
    SendToBackground()
  } catch (e) {
    log('Failed to send to background context. ' + e.message)
  }
}

/**
 * 주어진 type의 차단의 모드를 변경합니다.
 *
 * @param type 차단 종류
 * @param mode 차단 모드
 */
export const updateMode = (type: string, mode: string): void => {
  if (!checkValidType(type)) {
    throw new Error(
      `${type} is not a valid type. requires one of [${BLOCK_TYPES_KEYS.join(
        ', '
      )}]`
    )
  }

  if (!checkValidMode(mode)) {
    throw new Error(
      `${type} is not a valid mode. requires one of [${BLOCK_DETECT_MODE_KEYS.join(
        ', '
      )}]`
    )
  }

  InternalUpdateMode(type, mode)
}

/**
 * 해당 내용이 차단될 내용인지를 반환합니다.
 *
 * @param type 차단 종류
 * @param content 확인할 내용
 * @param gallery 현재 갤러리
 */
export const check = (
  type: string,
  content: string,
  gallery?: string
): boolean => {
  if (!checkValidType(type)) {
    throw new Error(
      `${type} is not a valid type. requires one of [${BLOCK_TYPES_KEYS.join(
        ', '
      )}]`
    )
  }

  if (!content || content.length < 1) {
    return false
  }

  const mode = BLOCK_MODE_CACHE[type]

  if (!BLOCK_CACHE[type] || BLOCK_CACHE[type].length < 1) {
    return false
  }

  const result = BLOCK_CACHE[type].filter(v => {
    if (v.gallery && v.gallery !== gallery) {
      return false
    }

    if (v.isRegex) {
      const regexd = new RegExp(v.content)
      const match = content.match(regexd)

      if (mode === BLOCK_DETECT_MODE.SAME) {
        return match && match[0] === content
      } else if (mode === BLOCK_DETECT_MODE.CONTAIN) {
        return regexd.test(content)
      } else if (mode === BLOCK_DETECT_MODE.NOT_SAME) {
        return !match || match[0] !== content
      } else if (mode === BLOCK_DETECT_MODE.NOT_CONTAIN) {
        return !regexd.test(content)
      }

      return false
    }

    if (mode === BLOCK_DETECT_MODE.SAME) {
      return v.content === content
    } else if (mode === BLOCK_DETECT_MODE.CONTAIN) {
      return v.content.indexOf(content) > -1
    } else if (mode === BLOCK_DETECT_MODE.NOT_SAME) {
      return v.content !== content
    } else if (mode === BLOCK_DETECT_MODE.NOT_CONTAIN) {
      return v.content.indexOf(content) === -1
    }

    return false
  })

  return result.length > 0
}

/**
 * obj에 있는 모든 키 값들이 차단 목록에 있는지 검사합니다.
 *
 * @param obj 검사할 객체
 * @param gallery 갤러리 이름 (선택)
 */
export const checkAll = (
  obj: { [index: string]: string },
  gallery?: string
): boolean => {
  let block = false

  Object.keys(obj).forEach(key => {
    if (block) {
      return
    }

    if (check(key, obj[key], gallery)) {
      block = true
    }
  })

  return block
}

/**
 * 데이터를 저장합니다. (내부)
 *
 * @param store
 * @param mode
 */
export const setStore = (store: any, mode: any): void => {
  BLOCK_CACHE = store
  BLOCK_MODE_CACHE = mode
}

runtime.onMessage.addListener((msg: { [index: string]: any }) => {
  if (msg.blockSelected) {
    eventBus.emit('RefresherRequestBlock')
  } else if (msg.updateBlocks) {
    setStore(msg.blocks_store, msg.blockModes_store)
  }
})
