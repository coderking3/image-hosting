import { ArrowRight, Copy, Database, Images, Upload } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'

import { MetalButton } from '@/components'

import styles from './Home.module.css'

const features = [
  {
    icon: Upload,
    title: '拖拽极速上传',
    desc: '支持拖拽、粘贴与批量选择，几秒内完成图片上传，操作简单直接。'
  },
  {
    icon: Database,
    title: '本地记录',
    desc: '通过 IndexedDB 技术，在本地持久化存储您的图片记录，随时查看历史上传。'
  },
  {
    icon: Images,
    title: '多格式支持',
    desc: '支持多种图片格式，满足您不同场景的图片托管需求。'
  },
  {
    icon: Copy,
    title: '一键复制链接',
    desc: '提供直链、Markdown、HTML 等多种格式，一键复制即可快速嵌入任意平台。'
  }
]

function StatsBadge() {
  const [count, setCount] = useState<number | '~'>('~')

  useEffect(() => {
    let cancelled = false

    // TODO: 换成你实际的统计接口
    // fetch('/api/stats')
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (!cancelled) setCount(data.totalImages)
    //   })
    //   .catch(() => {
    //     // 接口没就绪时静默失败，不渲染徽章
    //   })

    new Promise((resolve) => {
      // eslint-disable-next-line react/web-api-no-leaked-timeout
      setTimeout(resolve, 2000)
    }).then(() => {
      if (!cancelled) setCount(2307)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <a
      href="/gallery"
      className="inline-flex h-7 items-center rounded-[4.5px] bg-[#ffffff1a] pl-[3.3px] text-foreground no-underline transition-opacity hover:opacity-80"
    >
      {/* 动画指示器  */}
      <span className="relative flex size-5 items-center justify-center">
        <span
          className={`absolute size-1 rounded-full bg-success ${styles.ping}`}
        />
        <span
          className={`relative size-1 rounded-full bg-success ${styles.breathe}`}
        />
      </span>
      <span className="p-[6px_10px_5px_2px] font-mono text-caption [text-stroke-width:0.15px]">
        已托管 {count.toLocaleString()} 张图片
      </span>
    </a>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden xs:min-h-screen">
      {/* 内容 —— 绝对定位在顶部*/}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-5">
        <div className="mt-24 flex w-full max-w-212.5 flex-col items-start justify-center xs:mt-25 xs:items-center xs:justify-normal md:mt-32.5">
          {/* Badge */}
          <div className="mb-3.75 md:mb-3.5">
            <StatsBadge />
          </div>

          {/* H1 */}
          <h1 className="max-w-188.75 text-left font-sans text-[52px] leading-13.5 font-normal tracking-[-0.5px] text-foreground [text-stroke-width:0.9px] xs:text-center sm:text-display sm:leading-16.5 sm:tracking-[-0.7px]">
            <span className="block sm:inline-block">简单高效的</span>
            <span className="block sm:inline-block">图片托管服务</span>
          </h1>

          {/* 描述 */}
          <p className="mt-5 max-w-130 text-left font-sans text-[17px] leading-5.75 text-[#ffffffbf] xs:mx-auto xs:text-center sm:text-[19px] sm:leading-6">
            <span className="block xs:inline-block">拖拽即传，链接即得。</span>
            <span className="block xs:inline-block">多格式全面支持，</span>
            <br className="hidden xs:max-sm:block" />
            <span className="block xs:inline-block">本地记录每一次上传，</span>
            <span className="block xs:inline-block">随时查看、随时使用。</span>
          </p>

          {/* 按钮组 */}
          <div className="relative z-99 mt-6.5 flex items-center gap-2 md:mt-5.75">
            <MetalButton variant="pill" href="/upload">
              上传图片 <Upload className="size-3.75" />
            </MetalButton>
            <MetalButton variant="secondary" href="/gallery">
              查看画廊 <Images className="size-4" />
            </MetalButton>
          </div>
        </div>
      </div>

      {/* Hero 桌面端图片（本来就是 min-width 写法，无需改） */}
      <img
        src="/images/hero-hands.png"
        alt=""
        className="pointer-events-none relative mt-67.5 hidden w-[104%] max-w-none py-5 align-middle md:inline-block"
      />
      {/* Hero 移动端图片 */}
      <img
        src="/images/hero-hands-mobile.png"
        alt=""
        className="pointer-events-none relative mt-116.25 block w-[120%] max-w-none py-2.5 align-middle md:mt-70 md:hidden md:w-auto"
      />
    </section>
  )
}

function Features() {
  return (
    <>
      {/* Section Header  */}
      <section className="mx-auto mt-0 flex w-full flex-col items-center pt-0 pr-3.75 pl-5 xs:px-5 xs:pt-12.5 md:pt-0 ml:-mt-32.5 ml:pt-32.5">
        <div className="w-full max-w-212.5">
          <div className="flex flex-col items-start gap-1.25 md:gap-2">
            <div className="antialiased-no font-mono text-[14.5px] leading-heading-xs tracking-wide text-[#e7c59a] [text-stroke-width:0.1px] xs:text-[14px] xs:leading-5.25">
              <span className="font-medium tracking-widest">{`// `}</span>
              FEATURES
            </div>
            <h2 className="my-0 text-[42px] leading-11.25 font-normal tracking-heading-lg text-foreground [text-stroke-width:0.35px] xs:text-heading-lg xs:leading-heading-lg md:[text-stroke-width:0.5px]">
              图床的核心特点
            </h2>
          </div>
          <p className="mt-2.5 max-w-182.5 text-body leading-5.75 text-white/[74.9%] xs:leading-heading-xs">
            <span className="block xs:inline-block">
              专注于简单、可靠的图片托管体验，
            </span>
            <span className="block xs:inline-block">
              去掉一切不必要的复杂流程。
            </span>
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="mx-auto mt-3.75 flex w-full flex-col items-center overflow-hidden px-0 xs:mt-5 md:-mt-15 md:px-5 ml:-mt-6.25">
        <div className="mt-2.25 grid w-full grid-cols-1 rounded-[1px] border border-black p-0 md:mt-1.25 md:w-225 md:grid-cols-2 md:rounded-none md:border-0 md:bg-[url('/images/bg-services.svg')] md:bg-cover md:bg-center md:bg-no-repeat md:px-17.5 md:py-20 ml:w-271 ml:px-28.75 ml:py-13.75">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group -mt-px rounded-xs border-t border-b border-[#222] pt-5.5 pr-6.25 pb-8 pl-5 xs:pr-5.75 md:mt-0 md:rounded-none md:border-0 md:px-7.5 md:pt-8.25 md:pb-11.25 ml:px-10"
            >
              <Icon className="w-[23.3px] text-[#e7c59a]" strokeWidth={1.5} />

              <h3 className="mt-4.75 font-mono text-[17px] leading-5.75 font-normal text-foreground uppercase [text-stroke-width:0.1px] xs:text-heading-xs md:text-[17.5px]">
                {title}
              </h3>

              <p className="mt-2.75 text-[17.5px] leading-heading-xs text-white/75 xs:text-[17px] xs:leading-5.25 md:text-[17px] md:leading-heading-xs md:text-white/60">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function Usage() {
  return (
    <section className="mx-auto mt-0 mb-50 flex w-full flex-col items-center pt-12.5 pr-5.5 pl-5 xs:pr-5 md:-mt-10 md:mb-42.5 md:pt-22.5 ml:pt-32.5">
      <div className="flex w-full max-w-212.5 flex-col items-stretch justify-between gap-8.5 xs:gap-8.25 md:flex-row md:gap-0">
        {/* 标题 + 段落 + CTA */}
        <div className="flex flex-col items-start justify-between">
          {/* 标题块 */}
          <div className="flex flex-col items-start justify-center gap-1 md:gap-1.75">
            <span className="font-mono text-[14.5px] leading-heading-xs text-[#e7c59a] [text-stroke-width:0.1px] xs:text-[14px] xs:leading-5.25">
              <span className="font-medium tracking-widest">{`// `}</span>
              HOW IT WORKS
            </span>
            <h2 className="my-0 text-[42px] leading-11.25 font-normal tracking-heading-lg text-foreground [text-stroke-width:0.35px] xs:text-heading-lg xs:leading-heading-lg md:[text-stroke-width:0.5px]">
              简单上传，快速托管
            </h2>
          </div>

          {/* 段落 + CTA */}
          <div className="flex flex-col items-start gap-3 xs:gap-4 md:gap-4.25">
            <p className="my-0 mt-2.5 max-w-70 text-[16.4px] leading-heading-xs text-[#ffffffbf] md:mt-0">
              <span className="block">拖拽上传图片，自动生成访问链接，</span>
              <span className="block">轻松管理你的图片资源。</span>
            </p>
            <div className="hidden md:inline-block">
              <MetalButton variant="secondary" href="/upload">
                立即开始 <ArrowRight className="size-4" />
              </MetalButton>
            </div>
          </div>
        </div>

        {/* 数字轴 + 步骤列表 —— 始终横排，任何断点都不堆叠 */}
        <div className="flex flex-row items-start gap-3.75 xs:gap-5.75">
          {/* 数字轴 */}
          <div className="-mt-2 flex flex-col items-center justify-start xs:-mt-2.25">
            {Array.from({ length: 4 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={i}>
                <div className="text-caption leading-8.75 text-[#686868]">
                  {`0${i + 1}`}
                </div>
                {i < 3 && (
                  <div className="h-[72.5px] w-px border-l border-[#424242]" />
                )}
              </Fragment>
            ))}
          </div>

          {/* 步骤列表 */}
          <div className="flex flex-col items-start justify-start gap-8.75">
            <div className="flex flex-col items-start gap-2.5">
              <div className="font-mono text-body leading-5.25 text-foreground [text-stroke-width:0.15px] xs:text-[17px] md:text-body md:leading-normal">
                拖拽或粘贴
              </div>
              <div className="max-w-87.5 text-[17.5px] leading-5.25 text-[#ffffffbf] xs:text-[17px] md:max-w-100 md:text-[16.7px] md:leading-[21.3px]">
                把图片拖进页面，或直接 Ctrl+V
                粘贴，支持批量选择，多张图片同时处理。
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5">
              <div className="font-mono text-body leading-5.25 text-foreground [text-stroke-width:0.15px] xs:text-[17px] md:text-body md:leading-normal">
                自动生成链接
              </div>
              <div className="max-w-87.5 text-[17.5px] leading-5.25 text-[#ffffffbf] xs:text-[17px] md:max-w-100 md:text-[16.7px] md:leading-[21.3px]">
                上传完成后立即获得直链，同时支持 Markdown / HTML 格式一键复制。
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5">
              <div className="font-mono text-body leading-5.25 text-foreground [text-stroke-width:0.15px] xs:text-[17px] md:text-body md:leading-normal">
                本地自动归档
              </div>
              <div className="max-w-87.5 text-[17.5px] leading-5.25 text-[#ffffffbf] xs:text-[17px] md:max-w-100 md:text-[16.7px] md:leading-[21.3px]">
                链接、宽高等图片信息自动存入 IndexedDB，支持导出 JSON
                列表，随时找回历史图片。
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5">
              <div className="font-mono text-body leading-5.25 text-foreground [text-stroke-width:0.15px] xs:text-[17px] md:text-body md:leading-normal">
                随处分享使用
              </div>
              <div className="max-w-87.5 text-[17.5px] leading-5.25 text-[#ffffffbf] xs:text-[17px] md:max-w-100 md:text-[16.7px] md:leading-[21.3px]">
                把链接贴到博客、论坛、聊天工具，或去画廊页面统一管理所有图片。
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Usage />
    </>
  )
}

export default Home
