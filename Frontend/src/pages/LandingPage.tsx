import React, { useState, useEffect, useRef } from "react";
import {
  Workflow,
  Terminal,
  GitBranch,
  Layers,
  Globe,
  Code2,
  Database,
  Shield,
  Zap,
  MousePointer2,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import '../FlowboardLanding.css'; 
import { Link, useNavigate } from "react-router-dom";
import FooterSection from "@/components/landingPage/Footer";
//@ts-ignore

const Icon = ({ icon: IconName, ...props }) => <IconName {...props} />;

const FlowboardLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navigate =useNavigate();
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("animate-in");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-300 selection:bg-sky-500/30 font-sans overflow-x-hidden relative">

      <div className="fixed inset-0 pointer-events-none z-0">

        <div className="absolute inset-0 bg-grid opacity-100"></div>


        <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_50%_-30%,#1e3a8a,transparent)] opacity-40"></div>


        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[#0B1121] to-transparent"></div>
      </div>

      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#0B1121]/80 backdrop-blur-xl border-b border-white/5 h-16"
            : "bg-transparent h-24"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-600 to-blue-700 rounded-xl flex items-center justify-center relative overflow-hidden group shadow-lg shadow-sky-900/40 border border-white/10">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Icon
                icon={Workflow}
                className="w-4 h-4 text-white relative z-10"
              />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Flowboard
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-400">
            {["Product", "Solutions", "Enterprise", "Docs"].map((item) => (
              <a onClick={()=>{if(item==='Docs'){
                navigate(`/${item}`)
              }}}
                key={item}
                href="#"
                className="hover:text-sky-300 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to={localStorage.getItem('token')?'/dashboard':'/Auth'}>
           <button className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-all shadow-[0_0_20px_-5px_rgba(14,165,233,0.5)] border border-sky-400/20">
              Start Automating
            </button>
            </Link>
           
          </div>

          <button
            className="md:hidden text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon icon={mobileMenuOpen ? X : Menu} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 px-6 overflow-hidden min-h-[90vh] flex flex-col items-center z-10">
        {/* Hero Text */}
        <div className="max-w-4xl mx-auto text-center relative z-10 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/20 text-sky-300 text-[11px] font-mono tracking-wide mb-8 reveal-on-scroll shadow-[0_0_15px_-3px_rgba(14,165,233,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]"></span>
            V2.0 PUBLIC BETA
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-8 leading-[1.05] reveal-on-scroll">
            The visual backend for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-sky-200 to-blue-400">
              modern engineering teams.
            </span>
          </h1>

          <p
            className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed reveal-on-scroll"
            style={{ transitionDelay: "100ms" }}
          >
            Flowboard is the open-source workflow automation tool.
            Self-hostable, extendable, and designed for high-performance data
            processing.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal-on-scroll"
            style={{ transitionDelay: "200ms" }}
          >  <Link to={'/Docs'}>
            <button className="h-12 px-8 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-[0_0_30px_-5px_rgba(2,132,199,0.5)] flex items-center gap-2 group border border-sky-400/20">
             Documentation{" "}
              <Icon
                icon={ArrowRight}
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              />
            </button>
            </Link>
            <div className="h-12 px-8 rounded-lg bg-[#1e293b]/50 border border-slate-700/50 hover:bg-[#1e293b] text-slate-300 font-medium text-sm transition-all flex items-center gap-2 cursor-pointer font-mono group">
              <span className="text-sky-500">$</span> npx flowboard start
            </div>
          </div>
        </div>

 
        <div
          className="relative w-full max-w-[1200px] reveal-on-scroll"
          style={{ transitionDelay: "300ms" }}
        >

          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[85%] h-32 bg-sky-500/20 blur-[100px] -z-10 rounded-[100%]"></div>

          <div className="relative rounded-xl border border-sky-500/10 bg-[#0f172a] hero-glow overflow-hidden aspect-[16/9] md:aspect-[2.4/1] group shadow-2xl shadow-black">
 
            <div className="h-10 border-b border-white/5 bg-[#0f172a] flex items-center justify-between px-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#b40202] border border-white/5"></div>
                <div className="w-3 h-3 rounded-full bg-[#d3d009] border border-white/5"></div>
                <div className="w-3 h-3 rounded-full bg-[#02b902] border border-white/5"></div>
              </div>
              <div className="flex gap-6 text-[11px] font-medium text-slate-500">
                <span className="text-sky-200">Active Workflow</span>
                <span className="hover:text-sky-300 cursor-pointer transition-colors">
                  Logs
                </span>
                <span className="hover:text-sky-300 cursor-pointer transition-colors">
                  Config
                </span>
              </div>
              <div className="w-16"></div>
            </div>

            
            <div className="absolute inset-0 top-10 bg-[#0B1121] bg-[radial-gradient(#38bdf80d_1px,transparent_1px)] [background-size:24px_24px]">
    
              <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-white/5 flex flex-col items-center py-4 gap-6 bg-[#0f172a]/50 backdrop-blur-sm z-20">
                <div className="p-2 rounded bg-sky-500/20 text-sky-400">
                  <Icon icon={Workflow} size={20} />
                </div>
                <div className="p-2 rounded hover:bg-white/5 text-slate-500 transition-colors">
                  <Icon icon={Terminal} size={20} />
                </div>
                <div className="p-2 rounded hover:bg-white/5 text-slate-500 transition-colors">
                  <Icon icon={GitBranch} size={20} />
                </div>
                <div className="p-2 rounded hover:bg-white/5 text-slate-500 transition-colors">
                  <Icon icon={Layers} size={20} />
                </div>
              </div>

  
              <div className="absolute inset-0 left-16 overflow-hidden flex items-center justify-center">
            
                <div className="absolute top-6 right-6 flex gap-3 z-20">
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>{" "}
                    Live
                  </div>
                  <button className="px-4 py-1.5 rounded bg-sky-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-500 transition-colors">
                    Execute
                  </button>
                </div>

                <svg className="absolute inset-0 pointer-events-none z-0 opacity-40">
                  <path
                    d="M 380 300 C 480 300, 480 300, 580 300"
                    stroke="#334155"
                    strokeWidth="2"
                    fill="none"
                    className="group-hover:stroke-sky-500 transition-colors duration-700"
                  />
                  <path
                    d="M 780 300 C 880 300, 880 300, 980 300"
                    stroke="#334155"
                    strokeWidth="2"
                    fill="none"
                    className="group-hover:stroke-sky-500 transition-colors duration-700 delay-100"
                  />
                </svg>

                <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-52 bg-[#1e293b] border border-sky-500/10 rounded-lg p-4 shadow-xl hover:border-sky-500/40 transition-all cursor-pointer z-10 group/node">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                        <Icon icon={Globe} size={14} className="text-sky-400" />
                      </div>
                      <span className="text-xs font-bold text-sky-100 tracking-wide">
                        WEBHOOK
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#0B1121] rounded p-2 text-[10px] font-mono text-slate-400 border border-white/5 group-hover/node:text-sky-200 transition-colors">
                    POST /v1/hooks/payment
                  </div>
                </div>

                {/* Node 2: Logic */}
                <div className="absolute left-[50%] -translate-x-1/2 top-1/2 -translate-y-1/2 w-52 bg-[#1e293b] border border-sky-500/10 rounded-lg p-4 shadow-xl hover:border-sky-500/40 transition-all cursor-pointer z-10 group/node">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Icon
                          icon={Code2}
                          size={14}
                          className="text-amber-400"
                        />
                      </div>
                      <span className="text-xs font-bold text-sky-100 tracking-wide">
                        TRANSFORM
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#0B1121] rounded p-2 text-[10px] font-mono text-slate-400 border border-white/5 group-hover/node:text-amber-200 transition-colors">
                    return JSON.parse(body)
                  </div>
                </div>

                {/* Node 3: Output */}
                <div className="absolute right-[20%] top-1/2 -translate-y-1/2 w-52 bg-[#1e293b] border border-sky-500/10 rounded-lg p-4 shadow-xl hover:border-sky-500/40 transition-all cursor-pointer z-10 group/node">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Icon
                          icon={Database}
                          size={14}
                          className="text-indigo-400"
                        />
                      </div>
                      <span className="text-xs font-bold text-sky-100 tracking-wide">
                        POSTGRES
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#0B1121] rounded p-2 text-[10px] font-mono text-slate-400 border border-white/5 group-hover/node:text-indigo-200 transition-colors">
                    INSERT INTO transactions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
              Engineered for <span className="text-sky-400">scale</span>.
            </h2>
            <p className="text-slate-400 text-lg">
              Built on modern standards to handle millions of executions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 grid-rows-2 h-auto md:h-[600px]">
         
            <div className="glass-card md:col-span-4 rounded-3xl p-8 relative overflow-hidden group transition-all duration-500 hover:border-sky-500/30">
              <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 blur-[100px] -z-10 group-hover:bg-sky-500/20 transition-colors duration-500"></div>

              <div className="flex flex-col h-full justify-between relative z-10">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#0f172a] border border-sky-500/20 flex items-center justify-center mb-6 text-white shadow-lg">
                    <Icon
                      icon={MousePointer2}
                      size={20}
                      className="text-sky-400"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Drag & Drop Builder
                  </h3>
                  <p className="text-slate-400 max-w-sm">
                    Build complex logic branches visually. What you see is
                    exactly how your data flows.
                  </p>
                </div>

                <div className="w-full h-48 mt-8 rounded-xl bg-[#0B1121] border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-6 gap-2 p-3 opacity-20">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-sky-500/20 rounded animate-pulse"
                        style={{ animationDelay: i * 0.1 + "s" }}
                      ></div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] to-transparent"></div>
                </div>
              </div>
            </div>


            <div className="glass-card md:col-span-2 md:row-span-2 rounded-3xl p-8 relative overflow-hidden group transition-all duration-500 hover:border-amber-500/30">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="flex flex-col h-full">
                <div className="w-10 h-10 rounded-lg bg-[#0f172a] border border-amber-500/20 flex items-center justify-center mb-6 text-white shadow-lg">
                  <Icon icon={Terminal} size={20} className="text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Code Native
                </h3>
                <p className="text-slate-400 mb-8 text-sm">
                  Don't get stuck in a GUI. Write raw JavaScript whenever you
                  need custom transformation logic.
                </p>

                <div className="flex-1 rounded-xl bg-[#0B1121] border border-white/5 p-4 font-mono text-[11px] text-slate-400 shadow-inner group-hover:border-amber-500/30 transition-colors">
                  <div className="flex gap-2 mb-3 border-b border-white/5 pb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <span className="text-sky-400 ml-auto">transform.js</span>
                  </div>
                  <div className="leading-relaxed">
                    <span className="text-purple-400">export default</span>{" "}
                    <span className="text-blue-400">async</span>{" "}
                    <span className="text-amber-200">function</span>(items){" "}
                    {"{"}
                    <br />
                    &nbsp;&nbsp;
                    <span className="text-slate-500">// Pure JS logic</span>
                    <br />
                    &nbsp;&nbsp;<span className="text-purple-400">
                      return
                    </span>{" "}
                    items.map(i ={">"} {"{"}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;id: i.json.id,
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;value: i.json.val *{" "}
                    <span className="text-emerald-400">1.5</span>
                    <br />
                    &nbsp;&nbsp;{"}"});
                    <br />
                    {"}"}
                  </div>
                </div>
              </div>
            </div>

       
            <div className="glass-card md:col-span-2 rounded-3xl p-8 relative overflow-hidden group transition-all duration-500 hover:border-emerald-500/30">
              <div className="w-10 h-10 rounded-lg bg-[#0f172a] border border-emerald-500/20 flex items-center justify-center mb-4 text-white shadow-lg">
                <Icon icon={Shield} size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">SOC2 Ready</h3>
              <p className="text-slate-500 text-sm">
                Self-host in your own VPC. Your data never leaves your
                infrastructure.
              </p>
            </div>

         
            <div className="glass-card md:col-span-2 rounded-3xl p-8 relative overflow-hidden group transition-all duration-500 hover:border-indigo-500/30">
              <div className="w-10 h-10 rounded-lg bg-[#0f172a] border border-indigo-500/20 flex items-center justify-center mb-4 text-white shadow-lg">
                <Icon icon={Zap} size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Low Latency</h3>
              <p className="text-slate-500 text-sm">
                Built on Rust-based workers for millisecond execution times.
              </p>
            </div>
          </div>
        </div>
      </section>

    
     <FooterSection/>
    </div>
  );
};

export default FlowboardLanding;
