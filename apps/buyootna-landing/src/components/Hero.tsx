'use client'

import Image from 'next/image'

export default function Hero() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-b from-[#0A1118] via-[#0E1B28] to-[#0A1118]"
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A880]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-[#1E3A5F]/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        {/* Left Side: Copy and Downloads */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-right gap-6">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/5 text-xs font-semibold text-[#C5A880] mb-2">
            ✨ المنصة العقارية الأسهل في الكويت
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.25] text-white tracking-tight">
            ابحث عن عقارك المثالي واطلب{' '}
            <span className="bg-gradient-to-l from-[#C5A880] to-[#DFCDAB] bg-clip-text text-transparent">
              أفضل الخدمات المنزلية
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            بيوتنا هي وجهتكم المتكاملة للبحث عن شقق وفلل وعقارات للبيع أو
            الإيجار أو البدل في الكويت، بالإضافة إلى طلب خدمات المقاولات،
            الديكور، الكهرباء، والصيانة من شركات معتمدة وبشكل مباشر.
          </p>

          {/* App download badges */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
            {/* App Store Button */}
            <a
              href="#"
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-300 group shadow-md"
            >
              <svg
                className="w-7 h-7 text-white fill-current group-hover:scale-105 transition-transform duration-300"
                viewBox="0 0 24 24"
              >
                <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22c-1.31,0-1.72-.8-3.22-.8s-2,.78-3.25.82C7.89,22,6.9,20.65,6.07,19.43,4.37,17,3.07,12.5,4.82,9.47A5.27,5.27,0,0,1,9.27,6.8c1.37,0,2.67.95,3.51.95s2.43-1.15,4.06-1A5.33,5.33,0,0,1,21,9.45c-1.34.82-1.54,2.56-.2,3.62a3.86,3.86,0,0,1,1.15,2.44,3.87,3.87,0,0,1-1.3,2.53M15.91,4.17A4.47,4.47,0,0,0,17,1.07a4.57,4.57,0,0,0-3,1.57,4.14,4.14,0,0,0-1.16,3A3.79,3.79,0,0,0,15.91,4.17Z" />
              </svg>
              <div className="flex flex-col items-start leading-none text-right">
                <span className="text-[10px] text-zinc-400 font-medium mb-1">
                  حمل التطبيق من
                </span>
                <span className="text-sm font-semibold text-white">
                  App Store
                </span>
              </div>
            </a>

            {/* Google Play Button */}
            <a
              href="#"
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-300 group shadow-md"
            >
              <svg
                className="w-7 h-7 text-white fill-current group-hover:scale-105 transition-transform duration-300"
                viewBox="0 0 24 24"
              >
                <path d="M5,3.06a1,1,0,0,0-.46.83V20.11a1,1,0,0,0,.46.83L14.77,12Z M17.65,9.66,15.77,8.57,12,12l3.77,3.43,1.88-1.09A2.43,2.43,0,0,0,19,12,2.43,2.43,0,0,0,17.65,9.66Z M5.81,3.49l9.16,5.31L12,12ZM5.81,20.51,12,12l2.97,3.18-9.16,5.31A1,1,0,0,0,5.81,20.51Z" />
              </svg>
              <div className="flex flex-col items-start leading-none text-right">
                <span className="text-[10px] text-zinc-400 font-medium mb-1">
                  احصل عليه من
                </span>
                <span className="text-sm font-semibold text-white">
                  Google Play
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Right Side: App Visual Showcase */}
        <div className="lg:col-span-5 flex justify-center relative w-full h-[400px] sm:h-[500px]">
          {/* Floating Circle Backdrop */}
          <div className="absolute inset-0 m-auto w-64 h-64 bg-[#C5A880]/10 rounded-full border border-[#C5A880]/20 animate-pulse duration-[4s]" />

          {/* iPhone Mockup Frame */}
          <div className="relative w-[220px] h-[450px] bg-[#070D14] rounded-[40px] border-4 border-[#1B2936] shadow-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-500 z-20">
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#070D14] rounded-b-2xl z-30" />
            <Image
              src="/screenshot-1.png"
              alt="App Screen 1"
              fill
              sizes="300px"
              className="object-cover object-top pt-6"
              priority
            />
          </div>

          {/* Secondary Floating iPhone Mockup */}
          <div className="absolute -left-4 bottom-4 w-[180px] h-[370px] bg-[#070D14] rounded-[32px] border-4 border-[#1B2936] shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-500 z-10 hidden sm:block">
            <Image
              src="/screenshot-2.png"
              alt="App Screen 2"
              fill
              sizes="300px"
              className="object-cover object-top pt-4"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
