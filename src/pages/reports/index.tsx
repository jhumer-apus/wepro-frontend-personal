import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { FileBarChart, Users, User, BarChart3 } from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useEffect } from 'react'

export default function ReportsPage() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  // Redirect to user-activities by default
  useEffect(() => {
    router.replace('/reports/user-activities')
  }, [router])

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return <></>
}
