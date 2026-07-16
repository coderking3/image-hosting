import { Copy, Database, Images, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

import { KButton } from '@/components/kui'

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
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    // TODO: 换成你实际的统计接口
    // fetch('/api/stats')
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (!cancelled) setCount(data.totalImages)
    //   })
    //   .catch(() => {
    //     // 接口没就绪时静默失败，不渲染徽章，避免出现坏掉的空壳
    //   })

    new Promise((resolve) => {
      // eslint-disable-next-line react-web-api/no-leaked-timeout
      setTimeout(resolve, 2000)
    })
      .then(() => {
        if (!cancelled) setCount(2307)
      })
      .catch(() => {
        // 接口没就绪时静默失败，不渲染徽章，避免出现坏掉的空壳
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (count === null) return null

  return (
    <a
      href="/gallery"
      className="mb-3.5 inline-flex items-center gap-2 rounded-[4.5px] bg-white/10 px-2.5 py-1.5 text-white/90 transition-opacity hover:opacity-80"
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#98ff38] opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-[#98ff38]" />
      </span>
      <span className="font-mono text-[13px] tracking-tight">
        已托管 {count.toLocaleString()} 张图片
      </span>
    </a>
  )
}

function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 mx-auto mt-[130px] flex w-full max-w-[850px] flex-col items-center px-6 text-center">
        <StatsBadge />
        <h1
          className="text-chalk font-sans text-[36px] leading-[1.1] font-normal tracking-[-0.4px] sm:text-[52px] sm:leading-[1.05] sm:tracking-[-0.6px] lg:whitespace-nowrap"
          style={{ WebkitTextStroke: '0.8px currentColor' }}
        >
          简单高效的图片托管服务
        </h1>
        <p className="text-smoke mx-auto mt-6 max-w-[520px] font-sans text-[17px] leading-[23px] sm:text-[19px] sm:leading-[24px]">
          拖拽即传，链接即得。多格式全面支持，本地记录每一次上传，随时查看、随时使用。
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <KButton variant="primary" href="/upload">
            上传图片 <Upload className="size-3.75" />
          </KButton>
          <KButton variant="secondary" href="/gallery">
            查看画廊 <Images className="size-4" />
          </KButton>
        </div>
      </div>

      <img
        src="/images/hero-hands.png"
        alt=""
        className="pointer-events-none relative mt-[210px] hidden w-[104%] max-w-none pb-5 sm:block"
      />
      <img
        src="/images/hero-hands-mobile.png"
        alt=""
        className="pointer-events-none relative mt-[180px] w-[130%] max-w-none pb-8 sm:hidden"
      />
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="w-full bg-[#080808] px-6 py-24 sm:py-32">
      <div className="mx-auto flex max-w-[740px] flex-col items-center gap-2 text-center">
        <span className="font-mono text-[13px] tracking-wide text-[#e7c59a]">
          // FEATURES
        </span>
        <h2 className="text-chalk font-sans text-[32px] font-normal tracking-[-0.3px] sm:text-[44px]">
          图床的核心特点
        </h2>
        <p className="text-smoke mt-1 max-w-[520px] text-[16px] leading-[22px] sm:text-[18px]">
          专注于简单、可靠的图片托管体验，去掉一切不必要的复杂流程。
        </p>
      </div>

      {/* 2x2 网格，无卡片边框/背景，图标裸露排列 */}
      <div className="mx-auto mt-16 grid w-full max-w-[1084px] grid-cols-1 gap-x-24 gap-y-12 sm:grid-cols-2 sm:py-8">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-start">
            <Icon className="size-6 text-white/90" strokeWidth={1.5} />
            <h3 className="text-chalk mt-5 font-mono text-[16px] font-normal tracking-tight uppercase sm:text-[17.5px]">
              {title}
            </h3>
            <p className="text-smoke mt-3 text-[15px] leading-[22px] sm:text-[17px]">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  )
}
