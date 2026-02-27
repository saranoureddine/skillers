# Page Structure Guide

This document outlines the recommended structure for pages in the frontend application.

## Page Structure Pattern

Each page should follow this structure:

```
app/
├── (admin)/
│   ├── users/
│   │   ├── page.tsx          # Main page component
│   │   ├── components/       # Page-specific components
│   │   │   ├── users-table.tsx
│   │   │   └── user-form.tsx
│   │   └── hooks/            # Page-specific hooks (optional)
│   │       └── use-users.ts
│   └── ...
└── ...
```

## Page Component Structure

### Example: Users Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { usersService, User, PaginatedResponse } from '@/services/api';
import { UsersTable } from './components/users-table';
import { UserForm } from './components/user-form';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, [pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<User> = await usersService.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
      });
      
      setUsers(response.data);
      setPagination({
        ...pagination,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
      });
    } catch (error) {
      console.error('Failed to load users:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      await usersService.createUser(data);
      // Refresh list
      loadUsers();
      // Show success message
    } catch (error) {
      console.error('Failed to create user:', error);
      // Handle error
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await usersService.deleteUser(id);
      // Refresh list
      loadUsers();
      // Show success message
    } catch (error) {
      console.error('Failed to delete user:', error);
      // Handle error
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <UserForm onSubmit={handleCreateUser} />
      </div>
      
      <UsersTable
        users={users}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
```

## Best Practices

### 1. Use Client Components for Interactive Pages

```typescript
'use client'; // Always add this for pages with state/interactions
```

### 2. Separate Concerns

- **Page Component**: Handles data fetching and state management
- **Child Components**: Handle UI rendering
- **Services**: Handle API calls (already created)

### 3. Error Handling

```typescript
try {
  await usersService.someAction();
} catch (error) {
  // Use toast or other notification system
  toast.error(getErrorMessage(error));
}
```

### 4. Loading States

Always show loading states during API calls:

```typescript
const [loading, setLoading] = useState(true);

// In your component
{loading ? <LoadingSpinner /> : <YourContent />}
```

### 5. Form Handling

Use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  // ...
});

export function UserForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 6. Pagination

Handle pagination properly:

```typescript
const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
});

const loadData = async () => {
  const response = await service.getItems({
    page: pagination.page,
    limit: pagination.limit,
  });
  // Update state with response.data and response.meta
};
```

### 7. Authentication Checks

Check authentication before making API calls:

```typescript
useEffect(() => {
  const token = localStorage.getItem('skillers_auth_token');
  if (!token) {
    router.push('/login');
    return;
  }
  loadData();
}, []);
```

## File Organization

```
app/
├── (admin)/
│   ├── users/
│   │   ├── page.tsx                    # Main page
│   │   └── components/                 # Page-specific components
│   │       ├── users-table.tsx
│   │       ├── user-form.tsx
│   │       └── user-details.tsx
│   ├── posts/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── posts-list.tsx
│   │       └── post-card.tsx
│   └── ...
└── login/
    └── page.tsx
```

## Component Structure Template

```typescript
'use client';

import { useState, useEffect } from 'react';
import { [Service]Service, [Type] } from '@/services/api';

interface [Page]PageProps {
  // Props if needed
}

export default function [Page]Page({}: [Page]PageProps) {
  // State
  const [data, setData] = useState<[Type][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await [service].getItems();
      setData(response.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">[Page Title]</h1>
      {/* Your content */}
    </div>
  );
}
```

## Summary

1. ✅ Use `'use client'` for interactive pages
2. ✅ Import services from `@/services/api`
3. ✅ Handle loading and error states
4. ✅ Use proper TypeScript types
5. ✅ Separate page logic from UI components
6. ✅ Follow consistent naming conventions
7. ✅ Use React Hook Form for forms
8. ✅ Implement proper error handling
