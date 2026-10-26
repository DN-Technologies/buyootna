import React from 'react'
import StatCard from '@/components/StatCard'

interface UserStatsGridProps {
  totalTitle: string
  stats: {
    total: number
    active: number
    blocked: number
    suspended: number
  }
}

export const UserStatsGrid: React.FC<UserStatsGridProps> = ({
  totalTitle,
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={totalTitle}
        count={stats.total}
        variant="green"
      />
      <StatCard
        title="نشط"
        count={stats.active}
        variant="green"
      />
      <StatCard
        title="محظور"
        count={stats.blocked}
        variant="red"
      />
      <StatCard
        title="موقوف"
        count={stats.suspended}
        variant="orange"
      />
    </div>
  )
}

export default UserStatsGrid
