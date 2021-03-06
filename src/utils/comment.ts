import * as http from './http'

const _d = function (r: string) {
  const i = 'yL/M=zNa0bcPQdReSfTgUhViWjXkYIZmnpo+qArOBs1Ct2D3uE4Fv5G6wHl78xJ9K'

  let a,
    e,
    n,
    t,
    f,
    d,
    h,
    o = '',
    c = 0
  for (r = r.replace(/[^A-Za-z0-9+/=]/g, ''); c < r.length; )
    (t = i.indexOf(r.charAt(c++))),
    (f = i.indexOf(r.charAt(c++))),
    (d = i.indexOf(r.charAt(c++))),
    (h = i.indexOf(r.charAt(c++))),
    (a = (t << 2) | (f >> 4)),
    (e = ((15 & f) << 4) | (d >> 2)),
    (n = ((3 & d) << 6) | h),
    (o += String.fromCharCode(a)),
    64 != d && (o += String.fromCharCode(e)),
    64 != h && (o += String.fromCharCode(n))
  return o
}

let lastDomText = ''
let _r: string

const requestBeforeServiceCode = (dom: HTMLElement) => {
  if (!_r || lastDomText !== dom.innerHTML) {
    const _rpre = dom.querySelector(
      '#container > section #reply-setting-tmpl + script[type="text/javascript"]'
    )

    if (!_rpre) {
      throw new Error('_r 값을 찾을 수 없습니다.')
    }

    _r = _rpre.innerHTML

    const _rmatch = _r.match(/_d\('(.+)'/g)
    if (!_rmatch || !_rmatch[0]) {
      throw new Error('_d 값을 찾을 수 없습니다.')
    }

    _r = _d(_rmatch[0].replace(/(_d\(|')/g, ''))

    if (!_r || typeof _r !== 'string') {
      throw new Error('_r이 적절한 값이 아닙니다.')
    }

    if (lastDomText !== dom.innerHTML) {
      let tvl = _r,
        fi = parseInt(tvl.substr(0, 1))
      ;(fi = fi > 5 ? fi - 5 : fi + 4),
      (tvl = tvl.replace(/^./, fi.toString())),
      (_r = tvl)
    }
  }

  lastDomText = dom.innerHTML

  if ('string' == typeof _r) {
    const r = (dom.querySelector(
      'input[name="service_code"]'
    ) as HTMLInputElement).value
    const _rs = _r.split(',')
    let t = ''
    for (let e = 0; e < _rs.length; e++)
      t += String.fromCharCode((2 * (_rs[e] - e - 1)) / (13 - e - 1))
    return r.replace(/(.{10})$/, t)
  } else {
    throw new Error('_r이 적절한 값이 아닙니다.')
  }
}

const secretKey = (dom: HTMLElement) => {
  return (
    Array.from(dom.querySelectorAll('#focus_cmt > input'))
      .map((el) => {
        const id = el.getAttribute("name") || el.id
        if (
          id === 'service_code' ||
          id === 'gallery_no' ||
          id === 'clickbutton'
        ) {
          return ``
        } else {
          return `&${id}=${(el as HTMLInputElement).value}`
        }
      })
      .join('') + '&t_vch2=&g-recaptcha-response='
  )
}

interface CommentResult {
  result: string
  message: string | null
}

interface LogoutUser {
  name: string
  pw: string
}

export async function submitComment (
  preData: GalleryPreData,
  user: LogoutUser,
  dom: HTMLElement,
  memo: string,
  captcha?: string
): Promise<CommentResult> {
  let code: string

  try {
    code = requestBeforeServiceCode(dom)
  } catch (e) {
    return {
      result: 'PreNotWorking',
      message: e.message || '사전에 정의되지 않은 오류.'
    }
  }

  if (!code) {
    return {
      result: 'PreNotWorking',
      message: 'code 값이 없습니다.'
    }
  }

  if (!preData.gallery || !preData.id) {
    return {
      result: 'PreNotWorking',
      message: 'preData 값이 올바르지 않습니다. (확장 프로그램 오류)'
    }
  }

  if (typeof code !== 'string') {
    return {
      result: 'PreNotWorking',
      message: 'code 값이 올바르지 않습니다. (확장 프로그램 오류)'
    }
  }

  //   if (code.length !== 412 && code.length !== 402) {
  //     return {
  //       result: 'PreNotWorking',
  //       message:
  //         'code의 길이가 올바르지 않습니다. (확장 프로그램 오류) length=' +
  //         code.length
  //     }
  //   }

  const key = secretKey(dom) + `&service_code=${code}`

  const response = await http.make(http.urls.comments_submit, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    cache: 'no-store',
    referrer: location.href,
    body: `&id=${preData.gallery}&no=${preData.id}&name=${user.name}${
      user.pw ? '&password=' + user.pw : ''
    }${captcha ? '&code=' + captcha : ''}&memo=${encodeURI(memo)}${key}`
  })
  const res = response.split('||')

  return {
    result: res[0],
    message: res[1]
  }
}
