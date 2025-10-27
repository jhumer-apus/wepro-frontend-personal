import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { Users, Clock, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store/index'

const TABS = [
  { key: 'activeUsers', label: 'Active Users', icon: Users },
  { key: 'timesheet', label: 'Timesheet', icon: Clock },
]

export default function TimesheetLayout() {
  const router = useRouter()
  const { asPath, pathname } = router
  let currentTab: 'activeUsers' | 'timesheet' = 'activeUsers'
  if (asPath.includes('/timesheet/timesheet')) currentTab = 'timesheet'
  else if (asPath.includes('/activeUsers')) currentTab = 'activeUsers'

  // Get user data from Redux
  const userData = useSelector((state: RootState) => state.user.data)

  // State to store filtered permissions
  const [permissions, setPermissions] = useState<any[]>([])

  // Parse permissions from user data and filter by moduleCode
  useEffect(() => {
    if (userData?.permissions) {
      try {
        // Filter permissions where moduleCode is MOD009 or MOD016
        const filteredPermissions = userData.permissions.filter(
          (permission: any) => {
            return (
              permission.moduleCode === 'MOD009' ||
              permission.moduleCode === 'MOD016'
            )
          }
        )

        setPermissions(filteredPermissions)
      } catch (error) {
        console.error('Error parsing permissions:', error)
        setPermissions([])
      }
    } else {
      setPermissions([])
    }
  }, [userData?.permissions])

  // Redirect /timesheet to /timesheet/activeUsers only if we're at the exact /timesheet path
  useEffect(() => {
    if (pathname === '/timesheet' && asPath === '/timesheet') {
      router.replace('/timesheet/activeUsers')
    }
  }, [pathname, asPath, router])

  // If we're at the exact /timesheet path, show the tabbed interface
  if (pathname === '/timesheet' && asPath === '/timesheet') {
    return (
      <>
        <Head>
          <title>Timesheet - WePro</title>
          <meta
            name="description"
            content="Manage WePro timesheet and active users"
          />
        </Head>
      </>
    )
  }

  return null // This component will redirect, so no need to render anything
}
