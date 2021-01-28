import * as ip from '../utils/ip'

const USERTYPE = {
  UNFIXED: 0,
  HALFFIXED: 1,
  FIXED: 2,
  SUBMANAGER: 3,
  MANAGER: 4
}

const getType = (icon: string) => {
  if (icon == '' || icon === undefined) {
    return USERTYPE.UNFIXED
  }

  if (
    icon.indexOf('/fix_nik.gif') > -1 ||
    icon.indexOf('/dc20th_wgallcon4.') > -1
  ) {
    return USERTYPE.FIXED
  } else if (
    icon.indexOf('/nik.gif') > -1 ||
    icon.indexOf('/dc20th_wgallcon.') > -1
  ) {
    return USERTYPE.HALFFIXED
  } else if (
    icon.indexOf('sub_manager') > -1 ||
    icon.indexOf('/dc20th_wgallcon3.') > -1
  ) {
    return USERTYPE.SUBMANAGER
  } else if (
    icon.indexOf('manager') > -1 ||
    icon.indexOf('/dc20th_wgallcon2.') > -1
  ) {
    return USERTYPE.MANAGER
  }

  return USERTYPE.UNFIXED
}

export class User {
  nick: string
  id: string | null
  ip_data: string
  icon: string | null
  type: number
  __ip: string | null

  constructor (
    nick: string,
    id: string | null,
    ip: string | null,
    icon: string | null
  ) {
    this.__ip = ''
    this.ip_data = ''

    this.nick = nick
    this.id = id
    this.ip = ip
    this.icon = icon || ''
    this.type = getType(this.icon)
  }

  import (dom: HTMLElement | null) {
    if (dom === null) {
      return
    }

    const nick = dom.dataset.nick || ''
    const uid = dom.dataset.uid || ''
    const ip = dom.dataset.ip || ''

    const icon =
      uid !== null
        ? (
          (dom.querySelector('a.writer_nikcon img')! as HTMLImageElement) ||
            {}
        ).src
        : ''

    this.nick = nick
    this.id = uid
    this.ip = ip
    this.icon = icon
    this.type = getType(icon)

    return this
  }

  isLogout () {
    return this.ip !== null
  }

  isMember () {
    return this.id !== null
  }

  set ip (v: string | null) {
    this.ip_data = ip.format(ip.ISPData(v, ''))
    this.__ip = v || null
  }

  get ip () {
    return this.__ip
  }
}
