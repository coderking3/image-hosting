# 图床接口相关文档

### 登录用户空间详细信息

> https://${BASE_URL}/myinfo

_请求方式：GET_

认证方式：Cookie(SESSDATA)

**json回复：**

根对象：

| 字段    | 类型 | 内容     | 备注                      |
| ------- | ---- | -------- | ------------------------- |
| code    | num  | 返回值   | 0：成功<br />-101：未登录 |
| message | str  | 错误信息 | 默认为0                   |
| data    | obj  | 信息本体 |                           |

`data`对象：

| 字段            | 类型 | 内容         | 备注                     |
| --------------- | ---- | ------------ | ------------------------ |
| mid             | num  | mid          |                          |
| name            | str  | 昵称         |                          |
| sex             | str  | 性别         | 男 女 保密               |
| face            | str  | 头像图片url  |                          |
| sign            | str  | 签名         |                          |
| rank            | num  | 10000        | **作用尚不明确**         |
| level           | num  | 当前等级     | 0-6级                    |
| jointime        | num  | 0            | **作用尚不明确**         |
| moral           | num  | 节操         | 默认70                   |
| silence         | num  | 封禁状态     | 0：正常<br />1：被封     |
| email_status    | num  | 已验证邮箱   | 0：未验证<br />1：已验证 |
| tel_status      | num  | 已验证手机号 | 0：未验证<br />1：已验证 |
| identification  | num  | 1            | **作用尚不明确**         |
| vip             | obj  | 大会员状态   |                          |
| birthday        | num  | 生日         | 时间戳                   |
| is_tourist      | num  | 0            | **作用尚不明确**         |
| is_fake_account | num  | 0            | **作用尚不明确**         |
| pin_prompting   | num  | 0            | **作用尚不明确**         |
| is_deleted      | num  | 0            | **作用尚不明确**         |
| coins           | num  | 硬币数       |                          |
| following       | num  | 粉丝数       |                          |
| follower        | num  | 粉丝数       |                          |

`data`中的`vip`对象：

| 字段             | 类型 | 内容             | 备注                                            |
| ---------------- | ---- | ---------------- | ----------------------------------------------- |
| type             | num  | 会员类型         | 0：无<br />1：月大会员<br />2：年度及以上大会员 |
| status           | num  | 会员状态         | 0：无<br />1：有                                |
| due_date         | num  | 会员过期时间     | Unix时间戳(毫秒)                                |
| theme_type       | num  | 0                | 作用尚不明确                                    |
| label            | obj  | 会员标签         |                                                 |
| avatar_subscript | num  | 是否显示会员图标 | 0：不显示<br />1：显示                          |
| nickname_color   | str  | 会员昵称颜色     | 颜色码                                          |

`vip`中的`label`对象：

| 字段        | 类型 | 内容     | 备注                                                                                                        |
| ----------- | ---- | -------- | ----------------------------------------------------------------------------------------------------------- |
| path        | str  | 空       | 作用尚不明确                                                                                                |
| text        | str  | 会员名称 |                                                                                                             |
| label_theme | str  | 会员标签 | vip：大会员<br />annual_vip：年度大会员<br />ten_annual_vip：十年大会员<br />hundred_annual_vip：百年大会员 |

`data`中的`pendant`对象：

| 字段   | 类型 | 内容        | 备注                 |
| ------ | ---- | ----------- | -------------------- |
| pid    | num  | 挂件id      | **详细说明有待补充** |
| name   | str  | 挂件名称    |                      |
| image  | str  | 挂件图片url |                      |
| expire | num  | 0           | **作用尚不明确**     |

`data`中的`nameplate`对象：

| 字段        | 类型 | 内容             | 备注                 |
| ----------- | ---- | ---------------- | -------------------- |
| nid         | num  | 勋章id           | **详细说明有待补充** |
| name        | str  | 勋章名称         |                      |
| image       | str  | 挂件图片url 正常 |                      |
| image_small | str  | 勋章图片url 小   |                      |
| level       | str  | 勋章等级         |                      |
| condition   | str  | 勋章条件         |                      |

`data`中的`Official`对象：

| 字段  | 类型 | 内容     | 备注                                   |
| ----- | ---- | -------- | -------------------------------------- |
| role  | num  | 认证类型 | 见[用户认证类型一览](official_role.md) |
| title | str  | 认证信息 | 无为空                                 |
| desc  | str  | 认证备注 | 无为空                                 |
| type  | num  | 是否认证 | -1：无<br />0：认证                    |

`data`中的`level_exp`对象：

| 字段          | 类型 | 内容     | 备注                                       |
| ------------- | ---- | -------- | ------------------------------------------ |
| current_level | num  | 当前等级 | 0-6级                                      |
| current_min   | num  | 0        | 指当前等级从多少经验值开始                 |
| current_exp   | num  | 0        | 当前账户的经验值                           |
| next_exp      | num  | 0        | 下一个等级所需的经验值**(不是还需要多少)** |

**示例：**

```shell
curl -G 'https://api.bilibili.com/x/space/myinfo' \
-b 'SESSDATA=xxx'
```

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "mid": 293793435,
    "name": "社会易姐QwQ",
    "sex": "男",
    "face": "http://i0.hdslb.com/bfs/face/aebb2639a0d47f2ce1fec0631f412eaf53d4a0be.jpg",
    "sign": "高考刚结束的普通技术宅一枚，喜欢MC和编程以及电子，是车车人也是术术人，粉丝群:1136462265",
    "rank": 10000,
    "level": 5,
    "jointime": 0,
    "moral": 70,
    "silence": 0,
    "email_status": 1,
    "tel_status": 1,
    "identification": 1,
    "vip": {
      "type": 2,
      "status": 1,
      "due_date": 1644163200000,
      "vip_pay_type": 0,
      "theme_type": 0,
      "label": {
        "path": "",
        "text": "年度大会员",
        "label_theme": "annual_vip",
        "text_color": "#FFFFFF",
        "bg_style": 1,
        "bg_color": "#FB7299",
        "border_color": ""
      },
      "avatar_subscript": 1,
      "nickname_color": "#FB7299",
      "role": 3,
      "avatar_subscript_url": "http://i0.hdslb.com/bfs/vip/icon_Certification_big_member_22_3x.png"
    },
    "pendant": {
      "pid": 2511,
      "name": "初音未来13周年",
      "image": "http://i0.hdslb.com/bfs/garb/item/4f8f3f1f2d47f0dad84f66aa57acd4409ea46361.png",
      "expire": 0,
      "image_enhance": "http://i0.hdslb.com/bfs/garb/item/fe0b83b53e2342b16646f6e7a9370d8a867decdb.webp",
      "image_enhance_frame": "http://i0.hdslb.com/bfs/garb/item/127c507ec8448be30cf5f79500ecc6ef2fd32f2c.png"
    },
    "nameplate": {
      "nid": 4,
      "name": "青铜殿堂",
      "image": "http://i0.hdslb.com/bfs/face/2879cd5fb8518f7c6da75887994c1b2a7fe670bd.png",
      "image_small": "http://i0.hdslb.com/bfs/face/6707c120e00a3445933308fd9b7bd9fad99e9ec4.png",
      "level": "普通勋章",
      "condition": "单个自制视频总播放数\u003e=1万"
    },
    "official": {
      "role": 0,
      "title": "",
      "desc": "",
      "type": -1
    },
    "birthday": 1015257600,
    "is_tourist": 0,
    "is_fake_account": 0,
    "pin_prompting": 0,
    "is_deleted": 0,
    "in_reg_audit": 0,
    "is_rip_user": false,
    "profession": {
      "id": 0,
      "name": "",
      "show_name": ""
    },
    "level_exp": {
      "current_level": 5,
      "current_min": 10800,
      "current_exp": 27125,
      "next_exp": 28800
    },
    "coins": 9,
    "following": 1122,
    "follower": 1122
  }
}
```

</details>

### 申请二维码(web端)

> https://${BASE_URL}/qrcode/generate

_请求方式：GET_

密钥超时为180秒

**json回复：**

根对象：

| 字段    | 类型 | 内容     | 备注    |
| ------- | ---- | -------- | ------- |
| code    | num  | 返回值   | 0：成功 |
| message | str  | 错误信息 |         |
| data    | obj  | 信息本体 |         |

`data`对象：

| 字段       | 类型 | 内容                      | 备注       |
| ---------- | ---- | ------------------------- | ---------- |
| url        | str  | 二维码内容 (登录页面 url) |            |
| qrcode_key | str  | 扫码登录秘钥              | 恒为32字符 |

**示例：**

`url`中的值生成二维码，等待手机客户端扫描，并将`qrcode_key`保存备用

```shell
curl 'https://${BASE_URL}/qrcode/generate'
```

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "url": "https://passport.bilibili.com/h5-app/passport/login/scan?navhide=1\u0026qrcode_key=8587cf8106a0b863c46d6bab913537f6\u0026from=",
    "qrcode_key": "8587cf8106a0b863c46d6bab913537f6"
  }
}
```

</details>

### 扫码登录(web端)

> https://${BASE_URL}/qrcode/poll

_请求方式：GET_

**url参数：**

| 参数名     | 类型 | 内容         | 必要性 | 备注 |
| ---------- | ---- | ------------ | ------ | ---- |
| qrcode_key | str  | 扫码登录秘钥 | 必要   |      |

密钥超时为180秒

验证登录成功后会进行设置以下cookie项：

`DedeUserID` `DedeUserID__ckMd5` `SESSDATA` `bili_jct`

**json回复：**

根对象：

| 字段    | 类型 | 内容     | 备注    |
| ------- | ---- | -------- | ------- |
| code    | num  | 返回值   | 0：成功 |
| message | str  | 错误信息 |         |
| data    | obj  | 信息本体 |         |

data 对象：

| 字段          | 类型 | 内容                                                                                       | 备注                               |
| ------------- | ---- | ------------------------------------------------------------------------------------------ | ---------------------------------- |
| url           | str  | 游戏分站跨域登录 url                                                                       | 未登录为空                         |
| refresh_token | str  | 刷新`refresh_token`                                                                        | 未登录为空                         |
| timestamp     | num  | 登录时间                                                                                   | 未登录为`0`<br />时间戳 单位为毫秒 |
| code          | num  | 0：扫码登录成功<br />86038：二维码已失效<br />86090：二维码已扫码未确认<br />86101：未扫码 |                                    |
| message       | str  | 扫码状态信息                                                                               |                                    |

**示例：**

使用扫描秘钥`c3bd5286a2b40a822f5f60e9bf3f602e`登录

```shell
curl -G "https://${BASE_URL}/qrcode/poll"\
--data-urlencode 'qrcode_key=c3bd5286a2b40a822f5f60e9bf3f602e' \
-c 'cookie.txt'
```

当密钥正确时但未扫描时`code`为`86101`

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "url": "",
    "refresh_token": "",
    "timestamp": 0,
    "code": 86101,
    "message": "未扫码"
  }
}
```

</details>

扫描成功但手机端未确认时`code`为`86090`

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "url": "",
    "refresh_token": "",
    "timestamp": 0,
    "code": 86090,
    "message": "二维码已扫码未确认"
  }
}
```

</details>

扫描成功手机端确认登录后，`code`为`0`，并向浏览器写入cookie

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "url": "https://passport.biligame.com/crossDomain?DedeUserID=***\u0026DedeUserID__ckMd5=***\u0026Expires=***\u0026SESSDATA=***\u0026bili_jct=***\u0026gourl=https%3A%2F%2Fpassport.bilibili.com",
    "refresh_token": "***",
    "timestamp": 1662363009601,
    "code": 0,
    "message": ""
  }
}
```

</details>

**响应头部抓包信息：**

可明显看见设置了几个cookie

<details>
<summary>查看响应示例：</summary>

```http
HTTP/1.1 200 OK
Date: Mon, 05 Sep 2022 07:30:09 GMT
Expires: Mon, 05 Sep 2022 07:30:08 GMT
Cache-control: no-cache
Content-encoding: br
Content-type: application/json; charset=utf-8
bili-status-code: 0
bili-trace-id: 0d23fe044a6315a5
set-cookie: SESSDATA=***; Path=/; Domain=bilibili.com; Expires=Sat, 04 Mar 2023 07:30:09 GMT; HttpOnly; Secure
set-cookie: bili_jct=***; Path=/; Domain=bilibili.com; Expires=Sat, 04 Mar 2023 07:30:09 GMT
set-cookie: DedeUserID=***; Path=/; Domain=bilibili.com; Expires=Sat, 04 Mar 2023 07:30:09 GMT
set-cookie: DedeUserID__ckMd5=***; Path=/; Domain=bilibili.com; Expires=Sat, 04 Mar 2023 07:30:09 GMT
set-cookie: sid=***; Path=/; Domain=bilibili.com; Expires=Sat, 04 Mar 2023 07:30:09 GMT
x-bili-trace-id: 2fbd8abd97dbd4db0d23fe044a6315a5
x-cache-webcdn: BYPASS from blzone02
```

</details>

二维码失效时`code`为`86038`

<details>
<summary>查看响应示例：</summary>

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "url": "",
    "refresh_token": "",
    "timestamp": 0,
    "code": 86038,
    "message": "二维码已失效"
  }
}
```

</details>

### 图片上传(托管)

> https://${BASE_URL}/upload

_请求方式：GET_

认证方式：Cookie(SESSDATA,bili_jct)

**Form 参数：**

| 参数名 | 类型 | 内容     | 必要性 | 备注 |
| ------ | ---- | -------- | ------ | ---- |
| file   | File | 文件内容 | 必要   |      |

**json回复：**

根对象：

| 字段    | 类型 | 内容     | 备注    |
| ------- | ---- | -------- | ------- |
| code    | num  | 返回值   | 0：成功 |
| message | str  | 错误信息 |         |
| data    | obj  | 信息本体 |         |

data 对象：

| 字段     | 类型 | 内容     |
| -------- | ---- | -------- |
| location | str  | 图片链接 |
