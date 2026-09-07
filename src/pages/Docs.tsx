import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { cn, copyToClipboard } from '@/utils'

interface ParamRow {
  key: string
  range: string
  desc: string
}

const paramRows: ParamRow[] = [
  { key: 'w', range: '[1, 9223372036854775807]', desc: 'width，图像宽度' },
  { key: 'h', range: '[1, 9223372036854775807]', desc: 'height，图像高度' },
  { key: 's', range: '[1, 9223372036854775807]', desc: '作用未知' },
  {
    key: 'e',
    range: '[0, 2]',
    desc: 'resize，0:保留比例取其小，1:保留比例取其大，2:不保留原比例，不与 c 混用'
  },
  { key: 'p', range: '[1, 1000]', desc: '默认 100，放大倍数，不与 c 混用' },
  { key: 'q', range: '[1, 100]', desc: 'quality，默认 75，图像质量' },
  { key: 'o', range: '[0, 1]', desc: '作用未知' },
  { key: 'c', range: '[0, 1]', desc: 'clip，0:默认，1:裁剪' }
]

const formatRows: { type: string; url: string }[] = [
  { type: '原图', url: 'baseURL/1.jpg' },
  { type: '原分辨率，质量压缩', url: 'baseURL/1.jpg@1e_1c.jpg' },
  {
    type: '规定宽，高度自适应，质量压缩',
    url: 'baseURL/1.jpg@104w_1e_1c.jpg'
  },
  {
    type: '规定高，宽度自适应，质量压缩',
    url: 'baseURL/1.jpg@104h_1e_1c.jpg'
  },
  {
    type: '规定高宽，质量压缩',
    url: 'baseURL/1.jpg@104w_104h_1e_1c.jpg'
  },
  {
    type: '原分辨率，webp 格式（占用最小）',
    url: 'baseURL/1.jpg@1e_1c.webp'
  },
  {
    type: '规定高度，webp 格式（占用最小）',
    url: 'baseURL/1.jpg@104w_104h_1e_1c.webp'
  }
]

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-accent px-1.5 py-0.5 font-mono text-caption text-chalk">
      {children}
    </code>
  )
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await copyToClipboard(code)
    if (ok) {
      setCopied(true)
      setTimeout(setCopied, 1500, false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-popover">
      {lang && (
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
          <span className="font-mono text-caption text-smoke">{lang}</span>
        </div>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-0.5 right-0.5 flex size-7 items-center justify-center rounded-md text-smoke transition-colors hover:bg-accent hover:text-chalk"
        aria-label="复制代码"
      >
        {copied ? (
          <Check className="size-3.75 text-primary" />
        ) : (
          <Copy className="size-3.75" />
        )}
      </button>
      <pre className="overflow-x-auto p-3.75 pr-10 font-mono text-caption text-chalk">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mt-12.5 mb-3.75 text-heading-sm leading-heading-sm font-normal text-chalk first:mt-0">
      {children}
    </h2>
  )
}

function SubHeading({ children }: { children: string }) {
  return (
    <h3 className="mt-6.25 mb-2.5 text-heading-xs leading-heading-xs font-normal text-chalk">
      {children}
    </h3>
  )
}

export default function DocsPage() {
  return (
    <div className="mx-auto flex w-full max-w-212.5 flex-col items-start px-5 pt-25 pb-25 md:pt-32.5">
      <h1 className="my-0 text-[42px] leading-11.25 font-normal tracking-heading-lg text-chalk [text-stroke-width:0.35px] xs:text-heading-lg xs:leading-heading-lg md:[text-stroke-width:0.5px]">
        图片处理
      </h1>

      <div className="mt-8.75 w-full">
        <SectionHeading>图片格式</SectionHeading>
        <p className="text-body leading-heading-xs text-smoke">
          通过在原图链接后追加处理参数，可以获得裁剪、缩放、压缩或转换格式后的图片。
        </p>

        {/* 格式对照表：移动端横向滚动 */}
        <div className="mt-3.75 w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-140 border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-accent">
                <th className="px-3.75 py-2.5 text-caption font-medium text-smoke">
                  Type
                </th>
                <th className="px-3.75 py-2.5 text-caption font-medium text-smoke">
                  Url
                </th>
              </tr>
            </thead>
            <tbody>
              {formatRows.map((row, index) => (
                <tr
                  key={row.type}
                  className={cn(
                    index !== formatRows.length - 1 && 'border-b border-border'
                  )}
                >
                  <td className="px-3.75 py-2.5 text-caption text-chalk">
                    {row.type}
                  </td>
                  <td className="px-3.75 py-2.5">
                    <InlineCode>{row.url}</InlineCode>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4.5 text-body leading-heading-xs text-smoke">
          格式：
          <InlineCode>
            {String.raw`(图像原链接)@(\d+[whsepqoc]_?)*(\.(|webp|gif|png|jpg|jpeg))?$`}
          </InlineCode>
        </p>

        {/* 参数说明表 */}
        <div className="mt-3.75 w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-125 border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-accent">
                <th className="px-3.75 py-2.5 text-caption font-medium text-smoke">
                  参数
                </th>
                <th className="px-3.75 py-2.5 text-caption font-medium text-smoke">
                  取值范围
                </th>
                <th className="px-3.75 py-2.5 text-caption font-medium text-smoke">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              {paramRows.map((row, index) => (
                <tr
                  key={row.key}
                  className={cn(
                    index !== paramRows.length - 1 && 'border-b border-border'
                  )}
                >
                  <td className="px-3.75 py-2.5">
                    <InlineCode>{row.key}</InlineCode>
                  </td>
                  <td className="px-3.75 py-2.5 font-mono text-caption text-smoke">
                    {row.range}
                  </td>
                  <td className="px-3.75 py-2.5 text-caption text-chalk">
                    {row.desc}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="px-3.75 py-2.5" colSpan={2}>
                  <InlineCode>webp / png / jpeg / gif</InlineCode>
                </td>
                <td className="px-3.75 py-2.5 text-caption text-chalk">
                  不加则保留原格式
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul className="mt-3.75 flex list-disc flex-col gap-1.5 pl-5 text-caption text-smoke marker:text-border">
          <li>不区分大小写，相同的参数后面覆盖前面</li>
          <li>
            计算后的实际 <InlineCode>w×h</InlineCode> 不能大于原{' '}
            <InlineCode>w×h</InlineCode>，否则 wh 参数失效
          </li>
        </ul>
      </div>

      <div className="mt-12.5 w-full">
        <SectionHeading>防盗链解决方案</SectionHeading>

        <SubHeading>全站图片使用</SubHeading>
        <p className="text-body leading-heading-xs text-smoke">
          在 html 的 head 标签中设置如下标志，那么全站资源引用都不会携带
          referrer：
        </p>
        <div className="mt-2.5">
          <CodeBlock
            lang="html"
            code={`<meta name="referrer" content="no-referrer" />`}
          />
        </div>

        <SubHeading>新窗口打开</SubHeading>
        <p className="text-body leading-heading-xs text-smoke">
          主要设置 <InlineCode>rel="noreferrer"</InlineCode>，使用{' '}
          <InlineCode>window.open</InlineCode> 打开的话是会默认携带 referrer
          的，第一次还是会 403：
        </p>
        <div className="mt-2.5">
          <CodeBlock
            lang="html"
            code={`<a rel="noreferrer" target="_blank"></a>`}
          />
        </div>
      </div>
    </div>
  )
}
