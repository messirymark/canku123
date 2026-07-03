'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BaziCalculator } from '@/components/bazi/BaziCalculator'
import { BaziSearch } from '@/components/bazi/BaziSearch'

export default function Home() {
  const [activeTab, setActiveTab] = useState('calculate')

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-200/50 bg-white/80 backdrop-blur-md dark:bg-zinc-900/80 dark:border-zinc-700/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☰</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-amber-900 dark:text-amber-100">
                八字排盘 · 命理人生
              </h1>
              <p className="text-xs text-amber-700/70 dark:text-amber-300/50">
                节气换月令 · 子时换日柱
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-amber-100/50 dark:bg-zinc-800/50">
            <TabsTrigger value="calculate" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              排盘
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              查询
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculate" className="mt-0">
            <BaziCalculator />
          </TabsContent>

          <TabsContent value="search" className="mt-0">
            <BaziSearch />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-200/50 bg-white/50 dark:bg-zinc-900/50 dark:border-zinc-700/50">
        <div className="container mx-auto px-4 py-3 text-center text-xs text-amber-700/60 dark:text-amber-300/40">
          以节气换月令 · 以子时换日柱 · 大运流年 · 人生大事 · 相似八字查询
        </div>
      </footer>
    </div>
  )
}
