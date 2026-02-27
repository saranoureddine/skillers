# API Services

This directory contains all API service files that communicate with the backend NestJS API.

## Structure

```
services/api/
├── index.ts                 # Central export point
├── users.service.ts         # User authentication and management
├── chats.service.ts         # Chat and messaging
├── posts.service.ts         # Posts and comments
├── categories.service.ts    # Categories
├── notifications.service.ts # Notifications
└── README.md               # This file
```

## Usage

### Import Services

```typescript
// Import individual services
import { usersService, chatsService, postsService } from '@/services/api';

// Or import specific service
import usersService from '@/services/api/users.service';
```

### Example: Using Users Service

```typescript
'use client';

import { useState } from 'react';
import { usersService } from '@/services/api';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (phoneNumber: string, password: string) => {
    try {
      setLoading(true);
      const response = await usersService.login({
        phoneNumber,
        countryCode: '+961',
        password,
      });
      
      // Token is automatically stored in localStorage
      // User data is in response.data.data.user
      console.log('Logged in:', response.data.data.user);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your login form JSX
  );
}
```

### Example: Using Posts Service

```typescript
'use client';

import { useEffect, useState } from 'react';
import { postsService, Post } from '@/services/api';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postsService.getPosts({ page: 1, limit: 10 });
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your posts list JSX
  );
}
```

## Base API Client

The base API client (`lib/api/client.ts`) handles:

- **Authentication**: Automatically adds JWT token from localStorage to requests
- **Error Handling**: Global error interceptors for 401, 403, 500 errors
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Request/Response Interceptors**: Automatic token management

## Environment Variables

Make sure to set these in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_TOKEN_KEY=skillers_auth_token
```

## Service File Structure

Each service file follows this pattern:

```typescript
import apiClient, { ApiResponse, PaginatedResponse, getErrorMessage } from '@/lib/api/client';

class MyService {
  // Public endpoints
  async getItems(): Promise<ApiResponse<Item[]>> {
    try {
      const response = await apiClient.get('/public/items');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Admin endpoints
  async getAllItemsAdmin(): Promise<PaginatedResponse<Item>> {
    try {
      const response = await apiClient.get('/admin/items');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const myService = new MyService();
export default myService;
```

## Adding New Services

1. Create a new service file: `services/api/[module].service.ts`
2. Follow the existing pattern with proper TypeScript types
3. Export the service instance
4. Add to `services/api/index.ts` for easy imports

## Error Handling

All services use the `getErrorMessage` utility to extract error messages:

```typescript
try {
  await usersService.login(credentials);
} catch (error) {
  const message = getErrorMessage(error);
  // Display error message to user
  toast.error(message);
}
```

## Authentication

The API client automatically:
- Reads token from localStorage on each request
- Adds `Authorization: Bearer <token>` header
- Clears token and redirects on 401 errors (configurable)

To manually logout:
```typescript
usersService.logout();
```
