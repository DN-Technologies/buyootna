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
        change="8.1%"
        trend="up"
        variant="green"
      />
      <StatCard
        title="نشط"
        count={stats.active}
        change="8.1%"
        trend="up"
        variant="green"
      />
      <StatCard
        title="محظور"
        count={stats.blocked}
        change="3.2%"
        trend="down"
        variant="red"
      />
      <StatCard
        title="موقوف"
        count={stats.suspended}
        change="3.2%"
        trend="down"
        variant="orange"
      />
    </div>
  )
}

export default UserStatsGrid
