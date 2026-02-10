import ScheduleCalendar from '@/src/components/schedule/ScheduleCalendar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Calendar } from 'lucide-react'
import React from 'react'

const scheduleIndex: React.FC = (): React.JSX.Element => {
  return (
    <ScheduleCalendar />
  )
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Schedule
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          View and manage your team&apos;s schedule and appointments
        </p>
      </div>

      <Card className="wepro-card wepro-card-dark">
        <CardHeader>
          <CardTitle>Schedule Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Schedule view coming soon</p>
              <p className="text-sm">
                Calendar view with drag-and-drop scheduling
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default scheduleIndex
