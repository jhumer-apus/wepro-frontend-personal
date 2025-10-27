import { useAppSelector } from '@/src/store/hooks'
import { RootState } from '@/src/store'

export const useUser = () => {
  const user = useAppSelector((state: RootState) => state.user)

  return {
    user: user.data,
    loading: user.loading,
    error: user.error,
    isAuthenticated: !!user.data,
  }
}
