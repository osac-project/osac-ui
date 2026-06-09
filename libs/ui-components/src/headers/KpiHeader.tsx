import type { ReactNode } from 'react'
import { css, cx } from '@emotion/css'
import { StatCard } from '../components/cards/Card'
import type { StatCardTone } from '../components/cards/Card'

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const rowCss = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
`

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KpiItem {
  /** Stable key for reconciliation. Falls back to label if omitted. */
  key?: string
  /** Short label rendered above the value. */
  label: string
  /** Primary value — string or any React node. */
  value: ReactNode
  /** Optional secondary hint line below the value. */
  hint?: ReactNode
  /** Colour tone for the left accent bar. Defaults to `"default"` (blue). */
  tone?: StatCardTone
}

export interface KpiHeaderProps {
  items: KpiItem[]
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KpiHeader({ items, className }: KpiHeaderProps) {
  return (
    <div className={cx(rowCss, className)}>
      {items.map((item, i) => (
        <StatCard
          key={item.key ?? item.label ?? i}
          label={item.label}
          value={item.value}
          hint={item.hint}
          tone={item.tone}
        />
      ))}
    </div>
  )
}
