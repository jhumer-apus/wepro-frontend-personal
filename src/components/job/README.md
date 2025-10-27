# Job Settings Navigation Components

This directory contains reusable navigation components for the job settings pages.

## Components

### SettingsNavigation

A reusable component for the main settings navigation tabs that automatically highlights the active tab based on the current route.

**Features:**

- Automatically detects the current page and highlights the appropriate tab
- Handles nested routes properly (e.g., `/settings/job/status` will highlight the "Job" tab)
- Responsive design with consistent styling

**Usage:**

```tsx
import { SettingsNavigation } from '@/src/components/job';

// In your component
<SettingsNavigation />

// With custom className
<SettingsNavigation className="mb-4" />
```

**Navigation Items:**

- Company (`/settings/company/profile`)
- Job (`/settings/job/industry`)
- Notifications (`/settings/notifications`)
- Templates (`/settings/templates/sms`)
- Knowledge Hub (`/settings/knowledgeHub/announcements`)

### JobSettingsSubNavigation

A reusable component for the job-specific settings sub-navigation that automatically highlights the active tab and handles permissions.

**Features:**

- Automatically detects the current page and highlights the appropriate tab
- Handles permission-based visibility for certain tabs
- Supports custom styling and responsive design

**Usage:**

```tsx
import { JobSettingsSubNavigation } from '@/src/components/job';

// In your component with permission functions
<JobSettingsSubNavigation
  getUserType={getUserType}
  checkPermission={checkPermission}
/>

// With custom className
<JobSettingsSubNavigation
  className="mb-4"
  getUserType={getUserType}
  checkPermission={checkPermission}
/>
```

**Required Props:**

- `getUserType`: Function that returns the current user type (`() => string | null`)
- `checkPermission`: Function to check module permissions (`(module: string, action: string) => boolean`)

**Navigation Items:**

- Industry (`/settings/job/industry`)
- Job Types (`/settings/job/types`)
- Job Industries & Types (`/settings/job/categories-types`)
- Job Status (`/settings/job/status`) - Requires permission check
- Job Tags (`/settings/job/tags`)
- Job Notes (`/settings/job/tag-notes`)
- Metro Area (`/settings/job/metro-area`)
- Custom Fields (`/settings/job/custom-fields`)

## Migration Guide

To migrate existing navigation code to use these components:

1. **Replace Main Navigation:**

```tsx
// Before
<div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
  <Button variant="ghost" onClick={() => router.push('/settings/company/profile')}>
    <Building2 className="w-4 h-4 mr-2" />
    Company
  </Button>
  {/* ... other buttons */}
</div>

// After
<SettingsNavigation />
```

2. **Replace Sub Navigation:**

```tsx
// Before
<div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
  <Button variant="ghost" onClick={() => router.push('/settings/job/industry')}>
    <Factory className="w-4 h-4 mr-2" />
    Industry
  </Button>
  {/* ... other buttons */}
</div>

// After
<JobSettingsSubNavigation
  getUserType={getUserType}
  checkPermission={checkPermission}
/>
```

3. **Update Imports:**

```tsx
// Remove unused icon imports
import {
  Building2,
  Briefcase,
  Bell,
  FileText,
  Megaphone,
  Factory,
  CheckCircle,
  Layers,
  Tag,
  MapPin,
  Database,
} from 'lucide-react'

// Add component imports
import {
  SettingsNavigation,
  JobSettingsSubNavigation,
} from '@/src/components/job'
```

## Benefits

- **Consistency**: All settings pages will have the same navigation structure
- **Maintainability**: Changes to navigation only need to be made in one place
- **Automatic Highlighting**: Active tabs are automatically highlighted based on the current route
- **Permission Handling**: Built-in support for permission-based visibility
- **Responsive Design**: Consistent styling across all pages
- **Type Safety**: Full TypeScript support with proper interfaces

## Files That Can Be Updated

The following files can be updated to use these components:

- `src/pages/settings/job/industry/index.tsx`
- `src/pages/settings/job/types/index.tsx`
- `src/pages/settings/job/categories-types/index.tsx`
- `src/pages/settings/job/tags/index.tsx`
- `src/pages/settings/job/tag-notes/index.tsx`
- `src/pages/settings/job/metro-area/index.tsx`
- `src/pages/settings/job/custom-fields/index.tsx`
- `src/pages/settings/company/profile/index.tsx`
- `src/pages/settings/notifications/index.tsx`
- `src/pages/settings/templates/*/index.tsx`
- `src/pages/settings/knowledgeHub/*/index.tsx`
