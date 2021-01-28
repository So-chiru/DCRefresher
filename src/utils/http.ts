export const urls = {
  base: 'https://gall.dcinside.com/',
  gall: {
    major: 'https://gall.dcinside.com/',
    mini: 'https://gall.dcinside.com/mini/',
    minor: 'https://gall.dcinside.com/mgallery/'
  },
  view: 'board/view/?id=',
  vote: 'https://gall.dcinside.com/board/recommend/vote',
  captcha: 'https://gall.dcinside.com/kcaptcha/session',
  manage: {
    delete:
      'https://gall.dcinside.com/ajax/minor_manager_board_ajax/delete_list',
    deleteMini:
      'https://gall.dcinside.com/ajax/mini_manager_board_ajax/delete_list',
    deleteUser: 'https://gall.dcinside.com/board/forms/delete_submit',
    setNotice:
      'https://gall.dcinside.com/ajax/minor_manager_board_ajax/set_notice',
    setNoticeMini:
      'https://gall.dcinside.com/ajax/mini_manager_board_ajax/set_notice',
    block:
      'https://gall.dcinside.com/ajax/minor_manager_board_ajax/update_avoid_list',
    blockMini:
      'https://gall.dcinside.com/ajax/mini_manager_board_ajax/update_avoid_list',
    setRecommend:
      'https://gall.dcinside.com/ajax/minor_manager_board_ajax/set_recommend',
    setRecommendMini:
      'https://gall.dcinside.com/ajax/mini_manager_board_ajax/set_recommend'
  },
  comments: 'https://gall.dcinside.com/board/comment/',
  comments_submit: 'https://gall.dcinside.com/board/forms/comment_submit',
  dccon: {
    detail: 'https://gall.dcinside.com/dccon/package_detail',
    info: 'https://dccon.dcinside.com/index/get_info',
    buy: 'https://dccon.dcinside.com/index/buy'
  }
}

export const types = {
  MAJOR: '',
  MINOR: 'mgallery',
  MINI: 'mini'
}

export const commentGallTypes: { [index: string]: string } = {
  '': 'G',
  mgallery: 'M',
  mini: 'MI'
}

export const heads = {
  'X-Requested-With': 'XMLHttpRequest'
}

export const viewRegex = /\/board\/view\//g
export const mgall = /dcinside\.com\/mgallery/g

export const view = (url: string) => {
  let type = galleryType(url)

  if (type === types.MINI) {
    type = urls.gall.mini
  } else if (type === types.MINOR) {
    type = urls.gall.minor
  } else {
    type = urls.gall.major
  }

  const urlParse = new URL(url)
  const queries = new URLSearchParams(
    url.replace(urlParse.origin + urlParse.pathname, '')
  )

  if (queries.has('no')) {
    queries.delete('no')
  }

  return type + 'board/lists?' + queries.toString()
}

export const make = (url: string, options: object) =>
  new Promise<string>((resolve, reject) =>
    fetch(url, options)
      .then(async response => {
        if (response.status && response.status > 400) {
          reject(`${response.status} ${response.statusText}`)
        }

        resolve(await response.text())
      })
      .catch(e => {
        reject(e)
      })
  )

export const checkMinor = (url: string) =>
  /\.com\/mgallery/g.test(url || location.href)

export const checkMini = (url: string) =>
  /\.com\/mini/g.test(url || location.href)

/**
 * URL에서 갤러리 종류를 확인하여 반환합니다.
 *
 * @param url 갤러리 종류를 확인할 URL.
 * @param extra 마이너 갤러리와 미니 갤러리에 붙일 URL suffix.
 */
export const galleryType = (url: string, extra?: string) => {
  if (checkMinor(url)) {
    return types.MINOR + (extra && extra.length ? extra : '')
  } else if (checkMini(url)) {
    return types.MINI + (extra && extra.length ? extra : '')
  }

  return types.MAJOR
}

export const mergeParamURL = (origin: string, getFrom: string) => {
  const add: { [index: string]: any } = {}

  const originURL = new URL(origin)
  for (const [key, value] of originURL.searchParams) {
    add[key] = value
  }

  const fromURL = new URL(getFrom)
  for (const [key, value] of fromURL.searchParams) {
    add[key] = value
  }

  return '?' + new URLSearchParams(add).toString()
}

/**
 * URL에서 갤러리 종류를 확인하여 갤러리 종류 이름을 반환합니다.
 * (mgallery, mini, '')
 *
 * @param url
 */
export const galleryTypeName = (url: string) => {
  return commentGallTypes[galleryType(url)]
}

/**
 * 현재 URL의 query를 가져옵니다.
 *
 * @param name Query 이름
 */
export const queryString = (name: string) =>
  new URLSearchParams(window.location.search).get(name)
