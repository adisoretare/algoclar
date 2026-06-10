'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  code: string
}

export function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copiat!' : 'Copiază codul'}
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
