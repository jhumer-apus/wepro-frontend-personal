# Modules System Documentation

## Overview

The modules system provides a centralized way to manage and cache module data across the application. It uses Redux for state management and includes automatic caching to reduce API calls.

## Features

- **Caching**: Modules are cached for 1 hour to reduce API calls
- **Persistence**: Data persists across page refreshes using Redux Persist
- **Global State**: Modules are available to all components
- **Error Handling**: Proper error handling and loading states
- **Type Safety**: Full TypeScript support

## Usage

### Using the Custom Hook (Recommended)

```typescript
import { useModules } from '@/src/hooks/useModules';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/index';

function MyComponent() {
  const userData = useSelector((state: RootState) => state.user.data);
  const { modules, loading, error, refetch } = useModules(userData?.tenantId);

  if (loading) return <div>Loading modules...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {modules.map(module => (
        <div key={module._id}>
          <h3>{module.name}</h3>
          <p>Code: {module.code}</p>
          <div>
            Permissions: {module.permissions.map(p => p.key).join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Direct Redux Access

```typescript
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store/index'

function MyComponent() {
  const {
    data: modules,
    loading,
    error,
  } = useSelector((state: RootState) => state.modules)

  // Use modules data...
}
```

## Data Structure

### Module Interface

```typescript
interface Module {
  _id: string
  name: string
  isP1Module: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  code: string
  permissions: ModulePermission[]
}
```

### ModulePermission Interface

```typescript
interface ModulePermission {
  _id: string
  moduleCode: string
  key: string
  description: string
  createdAt: string
  updatedAt: string
}
```

## Redux Actions

- `setLoading(boolean)`: Set loading state
- `setModules(Module[])`: Set modules data and update cache timestamp
- `setError(string)`: Set error message
- `clearError()`: Clear error message
- `clearModules()`: Clear all modules data
- `forceRefresh()`: Clear cache timestamp to force next fetch to bypass cache

## Caching Strategy

- **Cache Duration**: 1 hour (60 _ 60 _ 1000 milliseconds)
- **Cache Key**: `lastFetched` timestamp in Redux state
- **Cache Invalidation**: Automatic when cache expires
- **Manual Refresh**: Use `refetch()` function from the hook
- **Force Refresh**: Use `forceRefresh()` to clear cache timestamp

## Hook Functions

The `useModules` hook provides several functions:

```typescript
const { modules, loading, error, refetch, forceRefresh } = useModules(tenantId)

// refetch() - Makes an immediate API call, bypassing cache
await refetch()

// forceRefresh() - Clears cache timestamp, next fetch will be fresh
forceRefresh()
```

**Difference between `refetch` and `forceRefresh`:**

- `refetch()`: Immediately makes an API call and updates the cache
- `forceRefresh()`: Clears the cache timestamp, so the next automatic fetch will be fresh

## API Integration

The system automatically handles different API response structures:

1. Direct array: `response.data`
2. Nested in modules: `response.data.modules`
3. Nested in data: `response.data.data`

## Error Handling

- Network errors are caught and logged
- Invalid response structures are handled gracefully
- Missing tenantId is properly handled
- Fallback to empty arrays prevents component crashes

## Best Practices

1. **Use the custom hook**: `useModules()` provides the best developer experience
2. **Check loading states**: Always handle loading and error states
3. **Cache awareness**: The system automatically uses cached data when available
4. **Type safety**: Use the provided TypeScript interfaces
5. **Error boundaries**: Implement error boundaries for better UX
6. **Refresh after mutations**: Always refresh modules data after creating/updating related data

## Cache Refresh After Mutations

When you create, update, or delete data that might affect modules (like roles, permissions, etc.), you should refresh the modules cache to ensure data consistency:

```typescript
// Example: After creating/updating a role
const { modules, refetch } = useModules(tenantId)

const handleSubmit = async (e: React.FormEvent) => {
  try {
    // Create or update role
    await apiService.post('/v1/role-management', roleData)

    // Refresh modules data to get latest permissions
    await refetch()

    // Navigate away
    router.push('/adminTeam/roles')
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### When to Refresh Cache

**✅ Refresh cache after:**

- Creating/updating roles
- Modifying user permissions
- Adding/removing modules
- Updating module permissions
- Any operation that affects module structure

**❌ Don't refresh cache after:**

- Reading data only
- Viewing modules
- Displaying existing data
- Operations that don't modify modules

### Examples

```typescript
// ✅ Good: Refresh after role creation
const handleCreateRole = async () => {
  await apiService.post('/v1/role-management', roleData)
  await refetch() // Refresh to get latest module data
}

// ✅ Good: Refresh after permission update
const handleUpdatePermissions = async () => {
  await apiService.put('/v1/permissions', permissionData)
  await refetch() // Refresh to get updated permissions
}

// ❌ Bad: Unnecessary refresh
const handleViewModules = () => {
  // Just viewing, no need to refresh
  console.log(modules)
}

// ✅ Good: Conditional refresh
const handleDataOperation = async () => {
  const result = await apiService.post('/v1/some-endpoint', data)

  // Only refresh if the operation affects modules
  if (result.data.affectsModules) {
    await refetch()
  }
}
```

This ensures that:

- New permissions are immediately available
- Updated module data is reflected
- Cache stays consistent with backend state
- Unnecessary API calls are avoided

## Example: Role Creation

```typescript
// In role creation component
const { modules: availableModules, loading: modulesLoading } = useModules(
  userData?.tenantId
)

// Initialize form when modules load
useEffect(() => {
  if (availableModules.length > 0) {
    setFormData(prev => ({
      ...prev,
      modulePermissions: availableModules.map(module => ({
        id: module._id,
        module: module._id,
        permissions: [],
      })),
    }))
  }
}, [availableModules])
```

## Migration from Local State

If you're migrating from local state to this system:

1. Replace local `useState` for modules with `useModules()` hook
2. Remove manual API calls for modules
3. Update loading state references to use `modulesLoading`
4. Remove local error handling for modules
5. Update TypeScript interfaces to use the centralized ones

## Performance Benefits

- **Reduced API calls**: Caching prevents unnecessary requests
- **Faster page loads**: Cached data loads instantly
- **Better UX**: Consistent loading states across components
- **Reduced server load**: Fewer requests to the backend
- **Memory efficiency**: Single source of truth for modules data
