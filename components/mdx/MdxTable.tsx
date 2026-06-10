import type React from 'react'

export function MdxTable(props: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-6 overflow-x-auto">
      <table
        className="w-full border-collapse font-mono text-sm"
        {...props}
      />
    </div>
  )
}

export function MdxTh(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className="border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground"
      {...props}
    />
  )
}

export function MdxTd(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className="border border-border px-4 py-2 text-foreground"
      {...props}
    />
  )
}
