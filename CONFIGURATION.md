# Environment Configuration Guide

This project includes a comprehensive configuration system that allows you to easily switch between different environments (development, staging, production) with different API base URLs and settings.

## Quick Start

1. **Copy environment files:**

   ```bash
   cp env.development.example .env.development
   cp env.staging.example .env.staging
   cp env.production.example .env.production
   ```

2. **Update the API URLs** in each `.env` file to match your actual API endpoints.

3. **Run the application** with the desired environment:

   ```bash
   # Development (default)
   npm run dev

   # Staging
   npm run dev:staging

   # Production
   npm run dev:prod
   ```

## Configuration Files

### Main Configuration (`src/config/index.ts`)

The main configuration file automatically detects the environment and provides the appropriate settings:

- **API Base URL**: Different endpoints for each environment
- **Timeout Settings**: Environment-specific timeout values
- **Feature Flags**: Enable/disable features per environment
- **Debug Mode**: Automatically enabled in development/staging

### Environment Variables

| Variable              | Description      | Example                                |
| --------------------- | ---------------- | -------------------------------------- |
| `NEXT_PUBLIC_ENV`     | Environment name | `development`, `staging`, `production` |
| `NEXT_PUBLIC_API_URL` | API base URL     | `http://localhost:3001/api`            |

## API Service (`src/services/api.ts`)

The API service provides a configured axios instance with:

- **Automatic base URL** from environment config
- **Request interceptors** for authentication
- **Response interceptors** for error handling
- **Automatic token management**
- **Development logging**

### Usage Example

```typescript
import { apiService } from '@/src/services/api'

// GET request
const users = await apiService.get('/users')

// POST request
const newUser = await apiService.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
})

// PUT request
const updatedUser = await apiService.put('/users/1', {
  name: 'Jane Doe',
})

// DELETE request
await apiService.delete('/users/1')
```

## React Hook (`src/hooks/useConfig.ts`)

Use the `useConfig` hook in your React components to access configuration:

```typescript
import { useConfig } from '@/src/hooks/useConfig'

function MyComponent() {
  const config = useConfig()

  return (
    <div>
      <p>Environment: {config.environment}</p>
      <p>API URL: {config.api.baseUrl}</p>
      <p>Is Development: {config.isDevelopment ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

## Available Scripts

| Script                  | Description                                   |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start development server (development config) |
| `npm run dev:staging`   | Start development server (staging config)     |
| `npm run dev:prod`      | Start development server (production config)  |
| `npm run build`         | Build for production (development config)     |
| `npm run build:staging` | Build for staging                             |
| `npm run build:prod`    | Build for production                          |
| `npm run start`         | Start production server (development config)  |
| `npm run start:staging` | Start production server (staging config)      |
| `npm run start:prod`    | Start production server (production config)   |

## Environment-Specific Settings

### Development

- **API URL**: `http://localhost:3001/api`
- **Timeout**: 10 seconds
- **Debug Mode**: Enabled
- **Analytics**: Disabled

### Staging

- **API URL**: `https://staging-api.wepro.ai/api`
- **Timeout**: 15 seconds
- **Debug Mode**: Enabled
- **Analytics**: Enabled

### Production

- **API URL**: `https://api.wepro.ai/api`
- **Timeout**: 20 seconds
- **Debug Mode**: Disabled
- **Analytics**: Enabled

## Error Handling

The API service includes automatic error handling:

- **401 Unauthorized**: Automatically clears auth token and redirects to login
- **403 Forbidden**: Logs access denied errors
- **500+ Server Errors**: Logs server errors
- **Network Errors**: Logs network connectivity issues

## Authentication

The API service automatically:

1. **Adds auth tokens** to requests from localStorage
2. **Handles token expiration** by redirecting to login
3. **Stores new tokens** from successful login responses

## Best Practices

1. **Always use the API service** instead of direct axios calls
2. **Use the useConfig hook** to access environment-specific settings
3. **Set environment variables** in your deployment platform
4. **Never commit sensitive data** in environment files
5. **Use feature flags** to enable/disable features per environment

## Deployment

For deployment, set the appropriate environment variables in your hosting platform:

### Vercel

```bash
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_API_URL=https://api.wepro.ai/api
```

### Netlify

```bash
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_API_URL=https://api.wepro.ai/api
```

### Docker

```dockerfile
ENV NEXT_PUBLIC_ENV=production
ENV NEXT_PUBLIC_API_URL=https://api.wepro.ai/api
```

## Troubleshooting

### Environment not detected correctly

- Check that `NEXT_PUBLIC_ENV` is set correctly
- Ensure environment files are in the root directory
- Restart the development server after changing environment files

### API calls failing

- Verify the API URL in your environment file
- Check that the API server is running
- Ensure CORS is configured correctly on the API server

### Authentication issues

- Check that auth tokens are being stored correctly
- Verify the token format matches your API expectations
- Ensure the API endpoints are correct
