import { css } from '@emotion/css'
import { Card, CardBody, CardTitle } from '@patternfly/react-core'

export interface SparklineCardProps {
  title: string
  unit: string
  /** Pre-computed SVG polyline points string, e.g. "0,30 10,25 20,35 ..." */
  points: string
}

const svgCss = css`
  width: 100%;
  height: 60px;
  display: block;
`

const unitCss = css`
  color: var(--pf-t--global--text--color--subtle);
`

export function SparklineCard({ title, unit, points }: SparklineCardProps) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <svg viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden className={svgCss}>
          <polyline
            points={points}
            fill="none"
            stroke="var(--pf-t--global--active-color--100)"
            strokeWidth="2"
          />
        </svg>
        <small className={unitCss}>{unit}</small>
      </CardBody>
    </Card>
  )
}
