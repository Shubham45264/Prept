import React from 'react'

export const MockUI = ({ rows = 3 }) => {
  return (
    <div className="mt-5 space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => {
        // Generate pseudo-random widths for the lines
        const widths = ['w-[75%]', 'w-[60%]', 'w-[85%]', 'w-[50%]', 'w-[70%]'];
        const width = widths[i % widths.length];
        
        return (
          <div 
            key={i} 
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-xs transition duration-300 hover:bg-white/[0.04]"
          >
            {/* Mock checkbox/bullet */}
            <div className="relative flex items-center justify-center w-5 h-5 rounded-md bg-white/[0.03] border border-white/10">
              {i === 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              )}
              {i === 1 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              )}
              {i >= 2 && (
                <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
              )}
            </div>
            
            {/* Mock text lines */}
            <div className="flex-1 space-y-1.5">
              <div className={`h-2 rounded bg-stone-700/60 ${width}`} />
              {i % 2 === 0 && (
                <div className="h-1.5 rounded bg-stone-800/40 w-[40%]" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MockUI
