import { useEffect, useState } from 'react'
import { NeonButton } from './ui/NeonButton';
import { Wrench, Zap, Camera, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeforeAfterSlider } from './ui/BeforeAfterSlider';
import { Footer } from './Footer';

type LandingPageProps = {
  onGetStarted: () => void;
};

export function LandingPage({ onGetStarted }: LandingPageProps) {

  const [state, setState] = useState(false)
  const [textIndex, setTextIndex] = useState(0);
  const texts = ["Plumbing", "Wiring", "Appliance", "Home"];

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const navigation = [
    { title: "How it Works", path: "#how-it-works" },
    { title: "Services", path: "#services" },
    { title: "Reviews", path: "#reviews" },
  ]

  useEffect(() => {
    document.onclick = (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".menu-btn")) setState(false);
    };
  }, [])


  const Brand = () => (
    <div className="flex items-center justify-between py-5 md:block">
      <a href="#" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">
          S
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tight">SnapRepair</span>
      </a>
      <div className="md:hidden">
        <button className="menu-btn text-slate-500 hover:text-slate-800"
          onClick={() => setState(!state)}
        >
          {
            state ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )
          }
        </button>
      </div>
    </div>
  )

  return (
    <div className='relative min-h-screen bg-orange-50/30 font-sans overflow-x-hidden'>
      <div className='absolute inset-0 blur-3xl h-[580px]' style={{ background: "linear-gradient(143.6deg, rgba(249, 115, 22, 0) 20.79%, rgba(253, 186, 116, 0.26) 40.92%, rgba(249, 115, 22, 0) 70.35%)" }}></div>
      <div className='relative'>
        <header>
          <div className={`md:hidden ${state ? "mx-2 pb-5" : "hidden"}`}>
            <Brand />
          </div>
          <nav className={`pb-5 md:text-sm ${state ? "absolute top-0 inset-x-0 bg-white shadow-lg rounded-xl border mx-2 mt-2 md:shadow-none md:border-none md:mx-0 md:mt-0 md:relative md:bg-transparent" : ""}`}>
            <div className="gap-x-14 items-center max-w-screen-xl mx-auto px-4 md:flex md:px-8">
              <Brand />
              <div className={`flex-1 items-center mt-8 md:mt-0 md:flex ${state ? 'block' : 'hidden'} `}>
                <ul className="flex-1 justify-center items-center space-y-6 md:flex md:space-x-6 md:space-y-0">
                  {
                    navigation.map((item, idx) => {
                      return (
                        <li key={idx} className="text-slate-700 hover:text-orange-600 font-medium transition-colors">
                          <a href={item.path} className="block">
                            {item.title}
                          </a>
                        </li>
                      )
                    })
                  }
                </ul>
                <div className="items-center justify-end mt-6 space-y-6 md:flex md:mt-0">
                  <button
                    onClick={onGetStarted}
                    className="flex items-center justify-center gap-x-1 py-2.5 px-6 text-white font-bold bg-slate-900 hover:bg-slate-800 active:bg-slate-900 rounded-full md:inline-flex transition-all hover:scale-105 shadow-lg shadow-slate-900/20"
                  >
                    Sign in
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </header>
        <section className="relative pt-20 lg:pt-32 pb-28">
          <div className="max-w-screen-xl mx-auto px-4 gap-12 text-slate-600 overflow-hidden md:px-8 md:flex items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className='flex-none space-y-8 max-w-xl'
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='inline-flex gap-x-6 items-center rounded-full p-1 pr-6 border border-orange-100 bg-white shadow-sm text-sm font-medium duration-150 hover:bg-orange-50 cursor-pointer'
              >
                <span className='inline-block rounded-full px-3 py-1 bg-orange-500 text-white shadow-sm'>
                  New
                </span>
                <p className='flex items-center text-slate-600'>
                  AI Diagnosis 2.0 is live
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2 text-orange-500">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </p>
              </motion.div>
              <h1 className="text-5xl text-slate-900 font-black sm:text-6xl leading-tight hover:scale-105 transition-transform duration-300 cursor-default">
                Fix your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 min-w-[300px] inline-block">
                  <AnimatePresence mode='wait'>
                    <motion.span
                      key={texts[textIndex]}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {texts[textIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <br />
                in a snap.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Instant AI diagnosis for appliances, plumbing, and more.
                Simply upload a photo and get expert solutions instantly.
              </p>
              <div className='flex items-center gap-x-4 sm:text-sm'>
                <button
                  onClick={onGetStarted}
                  className="bg-transparent p-0 border-none hover:scale-105 transition-transform duration-200"
                >
                  <NeonButton text="Get Started" onClick={onGetStarted} />
                </button>
                <button
                  onClick={onGetStarted}
                  className="flex items-center justify-center gap-x-2 py-4 px-8 text-slate-700 hover:text-slate-900 font-bold duration-150 md:inline-flex group"
                >
                  View Demo
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="pt-8 flex items-center gap-4 text-sm font-medium text-slate-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" />
                  ))}
                </div>
                <p>Trusted by 2,000+ homeowners</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className='flex-1 hidden md:block relative'
            >
              {/* Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-700"></div>

              <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-white/50 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-orange-50 p-4 rounded-2xl">
                    <Camera className="w-8 h-8 text-orange-500 mb-2" />
                    <div className="h-2 w-16 bg-orange-200 rounded mb-1"></div>
                    <div className="h-2 w-10 bg-orange-100 rounded"></div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <Zap className="w-8 h-8 text-blue-500 mb-2" />
                    <div className="h-2 w-16 bg-blue-200 rounded mb-1"></div>
                    <div className="h-2 w-10 bg-blue-100 rounded"></div>
                  </div>
                </div>
                {/* ... inside component */}
                <div className="space-y-3">
                  <div className="h-48 bg-slate-100 rounded-2xl w-full overflow-hidden relative">
                    <BeforeAfterSlider
                      beforeImage="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=1000"
                      afterImage="https://images.unsplash.com/photo-1505798577917-a651a48ea220?auto=format&fit=crop&q=80&w=1000"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="h-2 w-24 bg-green-200 rounded mb-1"></div>
                      <div className="h-2 w-16 bg-green-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white relative z-10 rounded-t-[3rem] -mt-10 shadow-xl border-t border-slate-100" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-orange-500 font-bold tracking-wider uppercase text-sm">How It Works</span>
              <h2 className="text-4xl font-black text-slate-900 mt-2 mb-4">Simple 3-Step Process</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Get your home back in order without the stress.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Camera,
                  title: "1. Snap & Upload",
                  desc: "Take a photo or video of the problem. Our AI instantly analyzes the issue.",
                  color: "bg-blue-500"
                },
                {
                  icon: Zap,
                  title: "2. Get Instant Triage",
                  desc: "Receive immediate DIY steps, safety warnings, and cost estimates.",
                  color: "bg-orange-500"
                },
                {
                  icon: Wrench,
                  title: "3. Expert Help",
                  desc: "Need more help? Chat with a verified expert or book a video call.",
                  color: "bg-green-500"
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative p-8 rounded-[2rem] bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group"
                >
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 relative z-10">
              Ready to Fix Your Home?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of happy customers who trust SnapRepair for instant solutions.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-transparent p-0 border-none relative z-10 hover:scale-105 transform duration-200"
            >
              <NeonButton text="Get Started Now" onClick={onGetStarted} />
            </button>
          </motion.div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
