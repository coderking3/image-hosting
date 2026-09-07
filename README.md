# King3 Image

一个简洁、响应式的哔哩哔哩图片上传与本地管理工具。

King3 Image 支持拖拽、粘贴和批量上传图片，并在上传完成后生成直链、Markdown 和 HTML。上传记录保存在浏览器本地，可以通过画廊进行搜索、筛选、预览和导出。

## 主要功能

- B 站扫码或凭证登录
- 拖拽、粘贴与批量上传
- 上传进度、并发控制、取消和重试
- 直链、Markdown、HTML 一键复制
- 本地画廊搜索、筛选、预览和批量管理
- 响应式缩略图、懒加载与图片链接处理

## 本地开发

需要 Node.js `^20.19.0` 或 `>=22.12.0`，并使用 pnpm 安装依赖。

```bash
git clone https://github.com/coderking3/image-hosting.git
cd image-hosting
pnpm install
```

根据 `.env.example` 创建 `.env`：

```env
# 后端请求地址
VITE_API_BASE_URL="/api"

# 是否启用本地 Mock API
MOCK_API_ENABLED="true"
```

启动开发服务器：

```bash
pnpm dev
```

访问 `http://localhost:3060`。

## License

[MIT](./LICENSE) © 2026 [king3](https://space.bilibili.com/627872080)
