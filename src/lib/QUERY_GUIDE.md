# TanStack Query Integration Guide

## Architecture

This project uses TanStack Query (React Query) for server state management. The setup is already configured in `src/lib/queryClient.ts` and wrapped in `src/app/_layout.tsx`.

## Query Key Factory

Query keys are centralized in `src/lib/queryKeys.ts`. This ensures consistency and makes refactoring easier.

**Why?** If you change a query later, you only update it in one place, and invalidation works automatically across the app.

### Adding New Query Keys

```typescript
// In src/lib/queryKeys.ts
export const queryKeys = {
  myFeature: () => [...queryKeys.all, 'myFeature'] as const,
  myFeatureList: () => [...queryKeys.myFeature(), 'list'] as const,
  myFeatureDetail: (id: string) => [...queryKeys.myFeature(), id] as const,
};
```

## Query Hooks

Place query hooks in `src/hooks/query/`. Follow the naming convention `useResourceName`.

### Example: Fetch List

```typescript
// src/hooks/query/usePregnancies.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

async function fetchPregnancies() {
  const { data, error } = await supabase
    .from('pregnancies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export function usePregnancies() {
  return useQuery({
    queryKey: queryKeys.pregnanciesList(),
    queryFn: fetchPregnancies,
  });
}
```

### Example: Fetch Single Item

```typescript
export function usePregnancy(id: string) {
  return useQuery({
    queryKey: queryKeys.pregnancyDetail(id),
    queryFn: () => fetchPregnancyDetail(id),
    enabled: !!id, // Only fetch if id is provided
  });
}
```

## Usage in Components

```typescript
import { usePregnancies } from '@/hooks/query/usePregnancies';

export function PregnanciesList() {
  const { data, isLoading, error } = usePregnancies();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {data?.map(pregnancy => (
        <Text key={pregnancy.id}>{pregnancy.id}</Text>
      ))}
    </View>
  );
}
```

## Mutation Hooks

Place mutations in `src/hooks/mutations/`. Use the pattern `useCreate/Update/Delete/ResourceName`.

### Example: Create

```typescript
// src/hooks/mutations/useCreatePregnancy.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

export function useCreatePregnancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePregnancyInput) => {
      const { data, error } = await supabase
        .from('pregnancies')
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate the list so it refetches
      queryClient.invalidateQueries({
        queryKey: queryKeys.pregnanciesList(),
      });
    },
  });
}
```

## Usage in Components

```typescript
import { useCreatePregnancy } from '@/hooks/mutations/useCreatePregnancy';

export function CreatePregnancyForm() {
  const { mutate, isPending, error } = useCreatePregnancy();

  const handleCreate = (input: CreatePregnancyInput) => {
    mutate(input, {
      onSuccess: () => {
        Alert.alert('Success', 'Pregnancy created');
      },
    });
  };

  return (
    <TouchableOpacity disabled={isPending} onPress={() => handleCreate({...})}>
      <Text>{isPending ? 'Creating...' : 'Create'}</Text>
    </TouchableOpacity>
  );
}
```

## Refetch on Screen Focus

The app automatically refetches when navigating back to a screen:

```typescript
// Already set up in useRefreshOnFocus.ts
useRefreshOnFocus(queryKeys.pregnanciesList());
```

## Offline Support

The app has built-in offline detection:
- Queries automatically pause when offline
- Mutations queue and retry when connection returns
- This is configured in `src/hooks/query/useOnlineManager.ts`

## Common Patterns

### Dependent Queries

```typescript
export function useCareJourneyWithAssessments(pregnancyId: string) {
  // First query fetches the pregnancy
  const pregnancy = usePregnancy(pregnancyId);
  
  // Second query only runs after pregnancy loads
  const assessments = useAssessments(pregnancyId, {
    enabled: !!pregnancy.data,
  });

  return { pregnancy, assessments };
}
```

### Prefetching (Improve UX)

```typescript
import { useQueryClient } from '@tanstack/react-query';

export function usePrePrefetchPregnancies() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.pregnanciesList(),
      queryFn: fetchPregnancies,
    });
  };
}
```

### Infinite Queries (Pagination)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function usePregnanciesInfinite() {
  return useInfiniteQuery({
    queryKey: queryKeys.pregnanciesList(),
    queryFn: ({ pageParam }) => fetchPregnancies(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length < 10 ? undefined : lastPageParam + 1,
  });
}
```

## Debugging

TanStack Query DevTools are available but commented out by default (too heavy for mobile).

To enable, uncomment in `src/app/_layout.tsx`:

```typescript
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools/native';
// <ReactQueryDevtools initialIsOpen={false} />
```

## Default Configuration

The query client in `src/lib/queryClient.ts` has these defaults:

- **Retry:** 2 attempts on failure
- **Stale Time:** 30 seconds (data is fresh for 30s)
- **GC Time:** 5 minutes (unused cache kept for 5 min, helps back/forward nav)

Customize per-query by passing options to `useQuery()`.

## Best Practices

✅ **Do:**
- Use query keys from the factory
- Enable dependent queries with `enabled`
- Invalidate related queries after mutations
- Use `onSuccess` for side effects
- Handle loading and error states

❌ **Don't:**
- Hardcode query keys
- Ignore error handling
- Create queries without suspense/loading fallbacks
- Fetch the same data twice
- Mutate cache directly (let React Query manage it)
