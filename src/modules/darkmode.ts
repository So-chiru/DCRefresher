import * as Color from '../utils/color'
import * as DOM from '../utils/dom'

const colorCorrection = (elem: HTMLElement) => {
  const fontAttr = elem.hasAttribute('color')

  const color = fontAttr ? elem.getAttribute('color') : elem.style.color

  if (!color) {
    return
  }

  const textColor = Color.parse(color)

  const contrast = Color.contrast(textColor, [41, 41, 41])

  if (contrast < 3) {
    const trans = Color.RGBtoHSL(textColor[0], textColor[1], textColor[2])
    trans[2] = Color.inverseColor(trans[2])
    const rollback = Color.HSLtoRGB(trans[0], trans[1], trans[2])

    if (fontAttr) {
      elem.setAttribute(
        'color',
        Color.RGBtoHEX(rollback[0], rollback[1], rollback[2])
      )
    } else {
      elem.style.color = `rgb(${rollback[0]}, ${rollback[1]}, ${rollback[2]})`
    }
  }
}

const contentColorFix = (el: HTMLElement) => {
  if (!el) return

  const qSelector = el.querySelector(
    '.refresher-frame:first-child .refresher-preview-contents'
  ) as HTMLElement

  DOM.traversal(qSelector).forEach(elem => {
    if (
      !elem.style ||
      !(elem.style.color || elem.hasAttribute('color')) ||
      elem.style.background ||
      elem.style.backgroundColor
    )
      return

    colorCorrection(elem)
  })
}

export default {
  name: '다크 모드',
  description: '페이지와 DCRefresher의 창을 어두운 색상으로 변경합니다.',
  author: { name: 'Sochiru', url: '' },
  top: true,
  memory: {
    uuid: null,
    uuid2: null,
    contentViewUUID: null
  },
  enable: false,
  default_enable: false,
  require: ['filter', 'eventBus'],
  func (filter: RefresherFilter, eventBus: RefresherEventBus): void {
    if (
      document &&
      document.documentElement &&
      document.documentElement.className.indexOf('refresherDark') < 0
    ) {
      document.documentElement.className += ' refresherDark'
    }

    this.memory.uuid = filter.add('html', (elem: HTMLElement) => {
      if (elem.className.indexOf('refresherDark') == -1) {
        elem.className += ' refresherDark'
      }
    })

    // 다크모드는 반응성이 중요하니깐 모듈에서 바로 로드 시키기
    filter.runSpecific(this.memory.uuid)

    this.memory.uuid2 = filter.add(
      '.gallview_contents .inner .writing_view_box *',
      (elem: HTMLElement) => {
        if (!elem.style || !(elem.style.color || elem.hasAttribute('color')))
          return

        colorCorrection(elem)
      }, {
        skipIfNotExists: true
      }
    )

    this.memory.contentViewUUID = eventBus.on('contentPreview', contentColorFix)
  },

  revoke (filter: RefresherFilter, eventBus: RefresherEventBus): void {
    document.documentElement.classList.remove('refresherDark')

    if (this.memory.uuid) {
      filter.remove(this.memory.uuid, true)
    }

    if (this.memory.uuid2) {
      filter.remove(this.memory.uuid2, true)
    }

    if (this.memory.contentViewUUID) {
      eventBus.remove('contentPreview', this.memory.contentViewUUID, true)
    }
  }
}
