export interface JobStat {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ComponentType<{ className?: string }>
  subtitle: string
}
