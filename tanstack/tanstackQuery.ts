export {}; // Is file ko module banate hain, taaki doosri files ke functions se naam na takrayein

type QueryKey = readonly unknown[]; // Query ko pehchanne ke liye key values ki list use hoti hai
type QueryStatus = "pending" | "success" | "error"; // Query ke data ki state yahan define hoti hai
type RetryDelay = number | ((failureCount: number) => number); // Retry ke beech ka fixed ya badalta hua delay yahan define hota hai

type QueryRecord<T> = { // Cache mein har query ki state aur result yahan store hota hai
  status: QueryStatus; // Yeh batata hai ki data load ho raha hai, mil gaya hai, ya request fail hui hai
  data: T | undefined; // Aakhri successful request ka data yahan rehta hai
  error: unknown; // Aakhri request fail hone par error yahan rehta hai
  isFetching: boolean; // Yeh batata hai ki background ya initial request abhi chal rahi hai
  failureCount: number; // Current request ke failed attempts ki ginti yahan rehti hai
  updatedAt: number; // Data aakhri baar kab successful hua, uska timestamp yahan rehta hai
  promise: Promise<T> | undefined; // Chal rahi request ka promise duplicate request rokne ke liye yahan rehta hai
  queryFn: () => Promise<T>; // Is query ka data laane wala function yahan save hota hai
  retry: number | false; // Retry ki maximum ginti ya retry band karne ka option yahan rehta hai
  retryDelay: RetryDelay; // Agli koshish se pehle rukne ka delay yahan save hota hai
  staleTime: number; // Data kitni der tak fresh maana jaaye, woh duration yahan rehta hai
}; // Query record ka type yahan khatam hota hai

type UseQueryOptions<T> = { // useQuery ko dene wale options ka type yahan define hota hai
  queryKey: QueryKey; // Cache mein query ko identify karne wali key yahan dete hain
  queryFn: () => Promise<T>; // Data laane wala async function yahan dete hain
  retry?: number | false; // Is option se failed request ki retries set ya band karte hain
  retryDelay?: RetryDelay; // Is option se retries ke beech ka wait time set karte hain
  staleTime?: number; // Is option se data ke fresh rehne ka samay milliseconds mein set karte hain
}; // useQuery options ka type yahan khatam hota hai






class QueryClient { // Query cache, retries aur refetch ko manage karne ke liye client banate hain
  private cache = new Map<string, QueryRecord<unknown>>(); // Har query ka record uski serialized key par cache karte hain

  useQuery<T>(options: UseQueryOptions<T>): QueryRecord<T> { // Query ki current state laakar zaroorat par request shuru karte hain
    const cacheKey = JSON.stringify(options.queryKey); // Query key ko cache mein dhoondhne layak string banate hain
    let query = this.cache.get(cacheKey) as QueryRecord<T> | undefined; // Is key ka pehle se cached record dhoondte hain
    const retry = options.retry ?? 3; // Option na diya ho toh request ko zyada se zyada teen baar retry karte hain
    const retryDelay = options.retryDelay ?? ((failureCount: number) => Math.min(1000 * 2 ** (failureCount - 1), 30_000)); // Default mein exponential backoff ko 30 second par cap karte hain
    const staleTime = options.staleTime ?? 0; // Option na diya ho toh data ko turant stale maante hain

    if (query === undefined) { // Agar yeh query pehli baar aayi hai toh uska cache record banate hain
      query = { status: "pending", data: undefined, error: undefined, isFetching: false, failureCount: 0, updatedAt: 0, promise: undefined, queryFn: options.queryFn, retry, retryDelay, staleTime }; // Query ki shuruati state aur config set karte hain
      this.cache.set(cacheKey, query); // Naye query record ko cache mein save karte hain
    } // Naya record banane wali condition yahan khatam hoti hai

    query.queryFn = options.queryFn; // Har render par query ka latest fetch function record mein rakhte hain
    query.retry = retry; // Query ke liye retry configuration update karte hain
    query.retryDelay = retryDelay; // Query ke liye retry delay configuration update karte hain
    query.staleTime = staleTime; // Query ke liye fresh rehne ka samay update karte hain

    const isStale = query.data === undefined || Date.now() - query.updatedAt >= query.staleTime; // Data na ho ya staleTime guzar gaya ho toh data stale hota hai
    if (isStale && query.promise === undefined) { // Stale data ho aur request na chal rahi ho toh fetch shuru karte hain
      void this.fetchQuery(query); // Request background mein shuru karke data render ko block nahi karte
    } // Stale query fetch karne wali condition yahan khatam hoti hai

    return query; // Current query state aur cached data caller ko de dete hain
  } // useQuery method yahan khatam hota hai

  refetch<T>(queryKey: QueryKey): Promise<T> { // Is method se cache wali query ko foran dobara fetch karte hain
    const cacheKey = JSON.stringify(queryKey); // Di hui key ko cache lookup ke liye string banate hain
    const query = this.cache.get(cacheKey) as QueryRecord<T> | undefined; // Cache mein is key ka query record dhoondte hain
    if (query === undefined) { // Agar query pehle register nahi hui ho toh
      return Promise.reject(new Error(`Query not found: ${cacheKey}`)); // Error return karte hain, missing query ko chupate nahi hain
    } // Query na milne wali condition yahan khatam hoti hai
    return this.fetchQuery(query); // Query ko force refetch karke uska promise caller ko dete hain
  } // refetch method yahan khatam hota hai

  private fetchQuery<T>(query: QueryRecord<T>): Promise<T> { // Query ko retry support ke saath fetch karne wala internal method yahan hai
    if (query.promise !== undefined) { // Agar isi query ki request pehle se chal rahi ho toh
      return query.promise; // Wahi promise return karke duplicate network request rok dete hain
    } // Duplicate request rokne wali condition yahan khatam hoti hai

    
    const hasCachedData = query.data !== undefined; // Check karte hain ki background fetch dikhane ke liye purana data hai ya nahi
    query.status = hasCachedData ? "success" : "pending"; // Purana data ho toh success status rakhkar usse screen par rehne dete hain
    query.isFetching = true; // Initial ya background request shuru hone ka status set karte hain
    query.failureCount = 0; // Nayi fetch cycle ke liye failed attempts ki ginti reset karte hain
    query.error = undefined; // Nayi fetch cycle ke liye pichhla error clear karte hain

    const runWithRetries = async (): Promise<T> => { // Request aur uski retry attempts ko async chalaate hain
      while (true) { // Success ya retries khatam hone tak request dobara try karte hain
        try { // Query function ko chala kar failure ko retry logic se handle karte hain
          const data = await query.queryFn(); // Server se naya data laane ke liye query function await karte hain
          query.data = data; // Naya successful data cache mein save karte hain
          query.updatedAt = Date.now(); // Data fresh hone ka current timestamp save karte hain
          query.status = "success"; // Query ko successful mark karte hain
          return data; // Mila hua data promise ke result ke roop mein return karte hain
        } catch (error: unknown) { // Request fail hone par us failure ko retry policy ke mutabik handle karte hain
          query.failureCount++; // Failed attempt ki ginti ek se badhaate hain
          const retriesExhausted = query.retry === false || query.failureCount > query.retry; // Check karte hain ki retries band hain ya limit poori ho gayi
          if (retriesExhausted) { // Aur koshish nahi karni ho toh
            query.status = "error"; // Query ko failed mark karte hain, purana data ho toh woh cache mein rehne dete hain
            query.error = error; // Aakhri asli error query state mein save karte hain
            throw error; // Error ko caller tak pahunchate hain, chupate nahi hain
          } // Retry limit check yahan khatam hota hai

          const delay = typeof query.retryDelay === "function" ? query.retryDelay(query.failureCount) : query.retryDelay; // Retry delay ko fixed value ya callback se calculate karte hain
          console.log(`Request fail hui; ${delay}ms baad retry ${query.failureCount}/${query.retry} chalega`); // Retry hone ki jaankari console mein dikhate hain
          await new Promise<void>((resolve) => setTimeout(resolve, delay)); // Agli request se pehle tay kiya hua delay wait karte hain
        } // Request try/catch yahan khatam hota hai
      } // Retry loop yahan khatam hota hai
    }; // Retry logic wala async function yahan khatam hota hai

    const promise = Promise.resolve().then(runWithRetries).finally(() => { // Request ko schedule karke complete hone par fetch state saaf karte hain
      query.isFetching = false; // Request khatam hone par fetching indicator band karte hain
      query.promise = undefined; // Complete request ka promise record se hataate hain
    }); // Promise cleanup handler yahan khatam hota hai
    query.promise = promise; // Chalti request ka promise save karke concurrent calls deduplicate karte hain
    return promise; // Request ka promise caller ko return karte hain
  } // fetchQuery method yahan khatam hota hai
} // QueryClient class yahan khatam hoti hai



















type User = { // Demo mein fetch hone wale user ka shape yahan define hota hai
  id: number; // User ki unique ID yahan hoti hai
  name: string; // User ka naam yahan hota hai
}; // User type yahan khatam hota hai

const queryClient = new QueryClient(); // Demo ke liye ek query client aur uska cache banate hain
let requestCount = 0; // Demo API kitni baar call hui, uska counter rakhte hain

async function fetchUser(): Promise<User> { // Retry aur refetch dikhane wala user fetch function yahan hai
  requestCount++; // Har network request par counter badhaate hain
  console.log(`API request #${requestCount} chal rahi hai...`); // Har request attempt ko console mein dikhate hain
  if (requestCount <= 2) { // Pehli do request jaan-boojhkar fail karte hain taaki retry dekh sakein
    throw new Error("Temporary network error"); // Retry flow test karne ke liye temporary error throw karte hain
  } // Demo failure condition yahan khatam hoti hai
  return { id: 1, name: requestCount === 3 ? "Suraj" : "Suraj (updated)" }; // Pehle success par aur background refetch par alag data return karte hain
} // fetchUser function yahan khatam hota hai

async function runDemo(): Promise<void> { // Retry aur background fetching ke steps yahan dikhate hain
  const userQuery = queryClient.useQuery({ queryKey: ["user", 1], queryFn: fetchUser, retry: 2, retryDelay: 100, staleTime: 1_000 }); // Do retries, chhota delay aur ek second fresh time wali query chalaate hain
  console.log(`Pehli render -> Status: ${userQuery.status}, Fetching: ${userQuery.isFetching}`); // Pehli request ki pending state dikhate hain

  await userQuery.promise; // Retry ke baad initial request successful hone ka intezaar karte hain
  console.log(`Data milne ke baad -> Status: ${userQuery.status}, Fetching: ${userQuery.isFetching}, User: ${userQuery.data?.name}`); // Data aur idle fetching state dikhate hain

  userQuery.updatedAt = 0; // Demo ke liye cached data ko stale banaate hain, jaise staleTime guzar gaya ho
  const backgroundQuery = queryClient.useQuery({ queryKey: ["user", 1], queryFn: fetchUser, retry: 2, retryDelay: 100, staleTime: 1_000 }); // Same query dobara maangkar background refetch shuru karte hain
  console.log(`Background fetch -> Status: ${backgroundQuery.status}, Fetching: ${backgroundQuery.isFetching}, Purana data: ${backgroundQuery.data?.name}`); // Request ke dauraan success status aur purana data dikhate hain

  await backgroundQuery.promise; // Background request complete hone ka intezaar karte hain
  console.log(`Refetch ke baad -> Status: ${backgroundQuery.status}, Fetching: ${backgroundQuery.isFetching}, Naya data: ${backgroundQuery.data?.name}`); // Refetch ke baad updated data dikhate hain

  await queryClient.refetch(["user", 1]); // Manual refetch se bhi query foran dobara chala sakte hain
  console.log(`Manual refetch -> User: ${backgroundQuery.data?.name}`); // Manual refetch ke baad ka naya data dikhate hain
} // runDemo function yahan khatam hota hai

void runDemo().catch((error: unknown) => { // Demo ka aakhri error bhi explicitly handle karte hain
  console.error("Demo query fail hui:", error); // Unexpected failure ko console mein report karte hain
}); // Demo error handler yahan khatam hota hai
