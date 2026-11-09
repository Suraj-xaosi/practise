export {}; 

type QueryKey = readonly unknown[]; 
type QueryStatus = "pending" | "success" | "error"; 
type RetryDelay = number | ((failureCount: number) => number); 

type QueryRecord<T> = { 
  status: QueryStatus; 
  data: T | undefined; 
  error: unknown; 
  isFetching: boolean; 
  failureCount: number; 
  updatedAt: number; 
  promise: Promise<T> | undefined; 
  queryFn: () => Promise<T>; 
  retry: number | false; 
  retryDelay: RetryDelay; 
  staleTime: number; 
}; 

type UseQueryOptions<T> = { 
  queryKey: QueryKey; 
  queryFn: () => Promise<T>; 
  retry?: number | false; 
  retryDelay?: RetryDelay; 
  staleTime?: number; 
}; 






class QueryClient { 
  private cache = new Map<string, QueryRecord<unknown>>(); 

  useQuery<T>(options: UseQueryOptions<T>): QueryRecord<T> { 
    const cacheKey = JSON.stringify(options.queryKey); 
    let query = this.cache.get(cacheKey) as QueryRecord<T> | undefined; 
    const retry = options.retry ?? 3; 
    const retryDelay = options.retryDelay ?? ((failureCount: number) => Math.min(1000 * 2 ** (failureCount - 1), 30_000)); 
    const staleTime = options.staleTime ?? 0; 

    if (query === undefined) { 
      query = { status: "pending", data: undefined, error: undefined, isFetching: false, failureCount: 0, updatedAt: 0, promise: undefined, queryFn: options.queryFn, retry, retryDelay, staleTime }; 
      this.cache.set(cacheKey, query); 
    } 

    query.queryFn = options.queryFn; 
    query.retry = retry; 
    query.retryDelay = retryDelay; 
    query.staleTime = staleTime; 

    const isStale = query.data === undefined || Date.now() - query.updatedAt >= query.staleTime; 
    if (isStale && query.promise === undefined) { 
      void this.fetchQuery(query); 
    } 

    return query; 
  } 

  refetch<T>(queryKey: QueryKey): Promise<T> { 
    const cacheKey = JSON.stringify(queryKey); 
    const query = this.cache.get(cacheKey) as QueryRecord<T> | undefined; 
    if (query === undefined) { 
      return Promise.reject(new Error(`Query not found: ${cacheKey}`)); 
    } 
    return this.fetchQuery(query); 
  } 

  private fetchQuery<T>(query: QueryRecord<T>): Promise<T> { 
    if (query.promise !== undefined) { 
      return query.promise; 
    } 

    
    const hasCachedData = query.data !== undefined; 
    query.status = hasCachedData ? "success" : "pending"; 
    query.isFetching = true; 
    query.failureCount = 0; 
    query.error = undefined; 

    const runWithRetries = async (): Promise<T> => { 
      while (true) { 
        try { 
          const data = await query.queryFn(); 
          query.data = data; 
          query.updatedAt = Date.now(); 
          query.status = "success"; 
          return data; 
        } catch (error: unknown) { 
          query.failureCount++; 
          const retriesExhausted = query.retry === false || query.failureCount > query.retry; 
          if (retriesExhausted) { 
            query.status = "error"; 
            query.error = error; 
            throw error; 
          } 

          const delay = typeof query.retryDelay === "function" ? query.retryDelay(query.failureCount) : query.retryDelay; 
          console.log(`Request fail hui; ${delay}ms baad retry ${query.failureCount}/${query.retry} chalega`); 
          await new Promise<void>((resolve) => setTimeout(resolve, delay)); 
        } 
      } 
    }; 

    const promise = Promise.resolve().then(runWithRetries).finally(() => { 
      query.isFetching = false; 
      query.promise = undefined; 
    }); 
    query.promise = promise; 
    return promise; 
  } 
} 



















type User = { 
  id: number; 
  name: string; 
}; 

const queryClient = new QueryClient(); 
let requestCount = 0; 

async function fetchUser(): Promise<User> { 
  requestCount++; 
  console.log(`API request #${requestCount} chal rahi hai...`); 
  if (requestCount <= 2) { 
    throw new Error("Temporary network error"); 
  } 
  return { id: 1, name: requestCount === 3 ? "Suraj" : "Suraj (updated)" }; 
} 

async function runDemo(): Promise<void> { 
  const userQuery = queryClient.useQuery({ queryKey: ["user", 1], queryFn: fetchUser, retry: 2, retryDelay: 100, staleTime: 1_000 }); 
  console.log(`Pehli render -> Status: ${userQuery.status}, Fetching: ${userQuery.isFetching}`); 

  await userQuery.promise; 
  console.log(`Data milne ke baad -> Status: ${userQuery.status}, Fetching: ${userQuery.isFetching}, User: ${userQuery.data?.name}`); 

  userQuery.updatedAt = 0; 
  const backgroundQuery = queryClient.useQuery({ queryKey: ["user", 1], queryFn: fetchUser, retry: 2, retryDelay: 100, staleTime: 1_000 }); 
  console.log(`Background fetch -> Status: ${backgroundQuery.status}, Fetching: ${backgroundQuery.isFetching}, Purana data: ${backgroundQuery.data?.name}`); 

  await backgroundQuery.promise; 
  console.log(`Refetch ke baad -> Status: ${backgroundQuery.status}, Fetching: ${backgroundQuery.isFetching}, Naya data: ${backgroundQuery.data?.name}`); 

  await queryClient.refetch(["user", 1]); 
  console.log(`Manual refetch -> User: ${backgroundQuery.data?.name}`); 
} 

void runDemo().catch((error: unknown) => { 
  console.error("Demo query fail hui:", error); 
}); 
