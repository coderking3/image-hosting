# 图片 oss

### 图片格式

| Type                         | Url                                |
| ---------------------------- | ---------------------------------- |
| 原图                         | baseURL/1.jpg                      |
| 原分辨率，质量压缩           | baseURL/1.jpg@1e_1c.jpg            |
| 规定宽，高度自适应，质量压缩 | baseURL/1.jpg@104w_1e_1c.jpg       |
| 规定高，宽度自适应，质量压缩 | baseURL/1.jpg@104h_1e_1c.jpg       |
| 规定高宽，质量压缩           | baseURL/1.jpg@104w_104h_1e_1c.jpg  |
| 原分辨率，webp格式(占用最小) | baseURL/1.jpg@1e_1c.webp           |
| 规定高度，webp格式(占用最小) | baseURL/1.jpg@104w_104h_1e_1c.webp |

格式：(图像原链接)@(\d+[whsepqoc]\_?)\*(\.(|webp|gif|png|jpg|jpeg))?$

- w:[1, 9223372036854775807] (width，图像宽度)
- h:[1, 9223372036854775807] (height，图像高度)
- s:[1, 9223372036854775807] (作用未知)
- e:[0,2] (resize，0:保留比例取其小，1:保留比例取其大，2:不保留原比例，不与c混用)
- p:[1,1000] (默认100，放大倍数，不与c混用)
- q:[1,100] (quality，默认75，图像质量)
- o:[0,1] (作用未知)
- c:[0,1] (clip，0:默认，1:裁剪)
- webp,png,jpeg,gif(不加则保留原格式)
- 不区分大小写，相同的参数后面覆盖前面
- 计算后的实际w*h不能大于原w*h，否则wh参数失效

### 防盗链解决方案

#### 全站图片使用

在html的head标签中设置如下标志，那么全站资源引用都不会携带referrer

```html
<meta name="referrer" content="no-referrer" />
```

#### 新窗口打开

主要设置rel="noreferrer"，使用window.open打开的话是会默认携带referrer的，第一次还是会403

```html
<a rel="noreferrer" target="_blank"></a>
```
