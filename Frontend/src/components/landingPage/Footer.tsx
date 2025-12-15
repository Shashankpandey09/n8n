import React from 'react';
import { Workflow, Globe } from 'lucide-react';

const Icon = ({ icon: IconName, ...props }) => <IconName {...props} />;

const FooterSection = () => {
    return (
        <footer className="border-t border-white/5 bg-[#0B1121] pt-20 pb-10 px-6 mt-20 relative z-10">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                {/* Left Column: Brand */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-900/20">
                            <Icon icon={Workflow} className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">
                            Flowboard
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
                        The open-source workflow automation platform for developers.
                        <br />
                        Built for scale, designed for speed.
                    </p>
                </div>

                {/* Right Column: Connect */}
                <div className="flex flex-col md:items-end justify-start">
                    <h4 className="text-white font-semibold mb-6 text-sm tracking-wide">Connect</h4>
                    <div className="flex gap-4">
                        {/* GitHub Icon */}
                        <a 
                            href="https://github.com/Shashankpandey09" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300 group"
                            aria-label="GitHub"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                                <path d="M9 18c-4.51 2-5-2-7-2"/>
                            </svg>
                        </a>

                        {/* X (Twitter) Icon */}
                        <a 
                            href="https://x.com/ShashankP2524" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300 group"
                            aria-label="X (Twitter)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                            </svg>
                        </a>

                        {/* LinkedIn Icon */}
                        <a 
                            href="https://linkedin.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300 group"
                            aria-label="LinkedIn"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                <rect width="4" height="12" x="2" y="9"/>
                                <circle cx="4" cy="4" r="2"/>
                            </svg>
                        </a>
                    </div>
                    <p className="mt-6 text-xs text-slate-500 font-medium md:text-right">
                        Follow us for the latest updates.
                    </p>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <span className="text-slate-600 text-xs font-medium">
                    © 2025 Flowboard Inc. All rights reserved.
                </span>
                <div className="flex gap-6 text-slate-600 items-center">
                    <Icon
                        icon={Globe}
                        size={16}
                        className="hover:text-white cursor-pointer transition-colors"
                    />
                    <div className="w-px h-3 bg-white/10"></div>
                    <span className="text-xs hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                        Status: <span className="text-emerald-500 font-medium">Operational</span>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;