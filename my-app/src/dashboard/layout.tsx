'use client';

import React,{ReactNode} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, Settings, Bell, Search, User, LogOut } from 'lucide-react';

interface DashboardLayoutProps{
    children: ReactNode;
}

export default function DashboardLayout({children}: DashboardLayoutProps){
    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-blue-500/30">

            <aside className="w-64 bg-slate-900/50 border-r border-white/5 backdrop-blur-xl flex flex-col hidden md:flex z-20 ">
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                         ProjectFlow
                     </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavItem href="/dashboard" icon={<Home size ={20}/> }label ="Dashboard"/>
                    <NavItem href ="/dashboard/projects" icon={<Folder size={20}/>} lablel ="Projects"/>
                    <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:border-blue-500/50 transition">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Demo User</p>
              <p className="text-xs text-slate-500 truncate">user@example.com</p>
            </div>
            <LogOut size={16} className="text-slate-500 hover:text-white transition" />
          </div>
        </div>
     </aside>

         <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/5 blur-[120px] pointer-events-none-z-10"/>

            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 backdrop-blur-sm z-20 bg-slate-950/50">
                <h1 className="text-sm font-medium text-slate-400">
            <span className="text-slate-600">App</span> / Dashboard
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 focus:ring-1 focus:ring-blue-500/50 transition-all w-64 placeholder:text-slate-600"
              />
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950"></span>
            </button>
          </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
           {children}
        </main>
      </div>
    </div>
  );
}

interface NavItemProps{
    href: string;
    icon: ReactNode;
    label: string
}

function NavItem({href, icon, label}: NavItemProps){
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
    <Link 
      href={href}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
        isActive 
          ? "bg-blue-600/10 text-blue-400 shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] border border-blue-600/20" 
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_2px_rgba(59,130,246,0.5)]" />
      )}
      
      <span className="relative z-10 flex items-center gap-3">
        {icon}
        {label}
      </span>
    </Link>
  );
}