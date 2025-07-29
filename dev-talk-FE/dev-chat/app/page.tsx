'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [authenticated, setauthenticated] = useState(false)
  useEffect(()=>{
    const user = localStorage.getItem("user")
    setauthenticated(!!user)
  },[])

  const handleGetStarted = () => {
    if(authenticated){
      router.push('/dashboard')
    }else{
      router.push('/signin')
    }
  }
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col">
      
      <header className="z-10 flex justify-between items-center px-12 py-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Dev<span className="text-purple-400">Chat</span>
        </h1>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="#features" className="hover:text-purple-400">Features</Link>
          <Link href="#about" className="hover:text-purple-400">About</Link>
          <Link href="#contact" className="hover:text-purple-400">Contact</Link>
          <Button className="ml-4 bg-purple-600 hover:bg-purple-700" onClick={()=>router.push('/signin')}>Sign In</Button>
        </nav>
      </header>

      <section className="z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Your Space to Speak
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mb-8">
          DevChat lets you spin up real-time chat rooms in a snap. Invite anyone. No downloads, no signups — just pure conversation.
        </p>
        <Link href="/dashboard">
          <Button className="px-6 py-3 text-lg bg-purple-500 hover:bg-purple-600" onClick={handleGetStarted}>
            Get Started
          </Button>
        </Link>
      </section>

      <div className="absolute top-[-150px] right-[-150px] w-[400px] h-[400px] bg-purple-500 opacity-20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] bg-pink-500 opacity-20 rounded-full blur-3xl pointer-events-none" />

      <footer className="z-10 text-center py-4 text-sm text-gray-500">
        © 2025 DevChat. All rights reserved.
      </footer>
    </main>
  );
}
