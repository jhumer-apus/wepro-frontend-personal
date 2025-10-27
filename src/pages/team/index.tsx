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
import { Users, Shield, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store/index'

const TABS = [
  { key: 'teamMembers', label: 'Team Members', icon: Users },
  { key: 'roles', label: 'Roles', icon: Shield },
]

// Note: Team members data is now fetched from API in the teamMembers page

// Mock data for roles
const mockRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access and control',
    permissions: ['read', 'write', 'delete', 'admin'],
    memberCount: 2,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Manage team and projects',
    permissions: ['read', 'write', 'manage'],
    memberCount: 5,
    status: 'Active',
  },
  {
    id: 3,
    name: 'User',
    description: 'Basic user access',
    permissions: ['read'],
    memberCount: 15,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Guest',
    description: 'Limited access for external users',
    permissions: ['read_limited'],
    memberCount: 3,
    status: 'Inactive',
  },
]

export default function AdminTeamLayout() {
  const router = useRouter()
  const { asPath, pathname } = router
  let currentTab: 'teamMembers' | 'roles' = 'teamMembers'
  if (asPath.includes('/roles')) currentTab = 'roles'
  else if (asPath.includes('/teamMembers')) currentTab = 'teamMembers'

  const [roles] = useState(mockRoles)

  // Get user data from Redux
  const userData = useSelector((state: RootState) => state.user.data)

  // State to store filtered permissions
  const [permissions, setPermissions] = useState<any[]>([])

  // Parse permissions from user data and filter by moduleCode
  useEffect(() => {
    if (userData?.permissions) {
      try {
        // Parse the permissions string from user data
        const parsedPermissions = JSON.parse(userData.permissions)
        // Filter out permissions where moduleCode isn't MOD002 or MOD003
        const filteredPermissions = parsedPermissions.filter(
          (permission: any) => {
            return (
              permission.moduleCode === 'MOD002' ||
              permission.moduleCode === 'MOD003'
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

  // Redirect /team to /team/teamMembers only if we're at the exact /team path
  useEffect(() => {
    if (pathname === '/team' && asPath === '/team') {
      router.replace('/team/teamMembers')
    }
  }, [pathname, asPath, router])

  // If we're at the exact /team path, show the tabbed interface
  if (pathname === '/team' && asPath === '/team') {
    return (
      <>
        <Head>
          <title>Admin Team - WePro</title>
          <meta
            name="description"
            content="Manage WePro admin team members and roles"
          />
        </Head>
      </>
    )
  }

  return null // This component will redirect, so no need to render anything
}
