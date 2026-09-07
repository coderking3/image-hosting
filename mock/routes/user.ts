import { defineRoutes } from 'kaivo'

import { hasAuthCookies, notLoggedIn, success } from '../util.ts'

export const userInfo = {
  mid: 293793435,
  name: 'king3',
  sex: '保密',
  face: '/favicon.svg',
  sign: '这是一个由 Katro 提供的本地 Mock 账号',
  rank: 10000,
  level: 6,
  jointime: 0,
  moral: 70,
  silence: 0,
  email_status: 1,
  tel_status: 1,
  identification: 1,
  vip: {
    type: 2,
    status: 1,
    due_date: 4_102_444_800_000,
    vip_pay_type: 0,
    theme_type: 0,
    label: {
      path: '',
      text: '年度大会员',
      label_theme: 'annual_vip',
      text_color: '#FFFFFF',
      bg_style: 1,
      bg_color: '#FB7299',
      border_color: ''
    },
    avatar_subscript: 1,
    nickname_color: '#FB7299'
  },
  pendant: {
    pid: 0,
    name: '',
    image: '',
    expire: 0
  },
  nameplate: {
    nid: 0,
    name: '',
    image: '',
    image_small: '',
    level: '',
    condition: ''
  },
  official: {
    role: 0,
    title: '',
    desc: '',
    type: -1
  },
  birthday: 0,
  is_tourist: 0,
  is_fake_account: 0,
  pin_prompting: 0,
  is_deleted: 0,
  level_exp: {
    current_level: 6,
    current_min: 28_800,
    current_exp: 42_000,
    next_exp: -1
  },
  coins: 100,
  following: 42,
  follower: 1024
}

export const userRoutes = defineRoutes({
  '/myinfo': (event) => {
    if (!hasAuthCookies(event)) return notLoggedIn()

    return success(userInfo)
  }
})
