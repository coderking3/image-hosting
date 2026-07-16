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
      // eslint-disable-next-line react-web-api/no-leaked-timeout
      setTimeout(resolve, 2000)
    })
      .then(() => {
        if (!cancelled) setCount(2307)
      })
      .catch(() => {
        // 接口没就绪时静默失败，不渲染徽章
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <a
      href="/gallery"
      className="text-chalk inline-flex items-center rounded-[4.5px] bg-[#ffffff1a] pl-[3.3px] no-underline transition-opacity hover:opacity-80"
    >
      {/* 动画指示器 —— 替代原站 Lottie */}
      <span className="relative flex size-5 items-center justify-center">
        <span className="absolute inline-flex size-2 animate-ping rounded-full bg-[#4da964] opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-[#4da964]" />
      </span>
      <span
        className="font-mono text-[13px]"
        style={{
          WebkitTextStrokeWidth: '0.15px',
          padding: '5.5px 10px 2.8px 2px'
        }}
      >
        已托管 {count.toLocaleString()} 张图片
      </span>
    </a>
  )
}

function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      {/* 内容 —— 绝对定位在顶部，与 Hyperstudio .div-block-207099 一致 */}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-5">
        <div className="mt-[130px] flex w-full max-w-[850px] flex-col items-center">
          {/* Badge 容器 对应 .div-block-207317 */}
          <div className="mb-[14px]">
            <StatsBadge />
          </div>

          {/* H1 对应 .text-block-790014686 */}
          <h1
            className="text-chalk max-w-[755px] text-center font-sans text-[52px] leading-[54px] font-normal tracking-[-0.5px] sm:text-[63px] sm:leading-[66px] sm:tracking-[-0.7px]"
            style={{ WebkitTextStrokeWidth: '0.9px' }}
          >
            简单高效的图片托管服务
          </h1>

          {/* 描述 对应 .text-block-790014705 */}
          <p className="mx-auto mt-5 max-w-[520px] text-center font-sans text-[17px] leading-[23px] text-[#ffffffbf] sm:text-[19px] sm:leading-6">
            拖拽即传，链接即得。多格式全面支持，本地记录每一次上传，随时查看、随时使用。
          </p>

          {/* 按钮组 对应 .div-block-6 */}
          <div className="relative z-[99] mt-[23px] flex items-center gap-2">
            <KButton variant="primary" href="/upload">
              上传图片 <Upload className="size-3.75" />
            </KButton>
            <KButton variant="secondary" href="/gallery">
              查看画廊 <Images className="size-4" />
            </KButton>
          </div>
        </div>
      </div>

      {/* Hero 桌面端图片 对应 .image-21021._2 */}
      <img
        src="/images/hero-hands.png"
        alt=""
        className="pointer-events-none relative mt-[270px] hidden w-[104%] max-w-none py-5 sm:block"
      />
      {/* Hero 移动端图片 对应 .image-21021-mob._2 */}
      <img
        src="/images/hero-hands-mobile.png"
        alt=""
        className="pointer-events-none relative mt-[280px] hidden max-w-none py-2.5 max-sm:block max-sm:w-[130%]"
      />
    </section>
  )
}

function FeaturesSection() {
  return (
    <>
      {/*
        Section Header —— 对应 Hyperstudio .section-97
        margin-top: -130px 制造与 Hero 区域的重叠，padding-top 补偿内容位置
      */}
      <section className="mx-auto -mt-[130px] flex w-full flex-col items-center px-5 pt-[130px] max-sm:mt-0 max-sm:pt-[50px]">
        <div className="w-full max-w-[850px]">
          {/* 对应 .div-block-207295 —— 左对齐 */}
          <div className="flex flex-col items-start gap-[7px]">
            <span
              className="font-mono text-[14px] leading-[21px] text-[#e7c59a]"
              style={{ WebkitTextStrokeWidth: '0.1px' }}
            >
              // FEATURES
            </span>
            <h2
              className="text-chalk text-[44px] leading-[47px] font-normal tracking-[-0.3px] max-sm:text-[42px] max-sm:leading-[45px]"
              style={{ WebkitTextStrokeWidth: '0.5px' }}
            >
              图床的核心特点
            </h2>
          </div>
          {/* 对应 .text-block-790014697 */}
          <p className="mt-[10px] max-w-[730px] text-[18px] leading-[22px] text-[#ffffffbf]">
            专注于简单、可靠的图片托管体验，去掉一切不必要的复杂流程。
          </p>
        </div>
      </section>

      {/*
        Cards Grid —— 对应 Hyperstudio .section-98 + .div-block-207302
        CSS Grid 2×2，固定宽度 1084px，大 padding，无 gap（间距由卡片自身 padding 形成）
      */}
      <section className="mx-auto -mt-[25px] flex w-full flex-col items-center overflow-hidden px-5 max-sm:mt-5">
        <div className="mt-[5px] grid w-full max-w-[1084px] grid-cols-1 bg-[#0d0d0d] px-[115px] py-[55px] sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group px-10 py-[33px] pb-[45px] max-sm:border-t max-sm:border-[#222] max-sm:px-5 max-sm:py-[22px] max-sm:pb-8"
            >
              <Icon className="w-[23.3px] text-white/90" strokeWidth={1.5} />
              <h3
                className="text-chalk mt-[19px] font-mono text-[17.5px] leading-[23px] font-normal uppercase"
                style={{ WebkitTextStrokeWidth: '0.1px' }}
              >
                {title}
              </h3>
              <p className="mt-[11px] text-[17px] leading-[22px] text-[#fff9]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
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
