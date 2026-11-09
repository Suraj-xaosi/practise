

export class LRUCache<K, V> { 
  private readonly cache = new Map<K, V>(); 

  constructor(private readonly capacity: number) { 
    if (!Number.isInteger(capacity) || capacity < 1) { 
      throw new RangeError("capacity must be a positive integer"); 
    } 
  } 

  get size(): number { 
    return this.cache.size; 
  } 

  get(key: K): V | undefined { 
    if (!this.cache.has(key)) { 
      return undefined; 
    } 

    const value = this.cache.get(key)!; 
    this.cache.delete(key); 
    this.cache.set(key, value); 
    return value; 
  } 

  has(key: K): boolean { 
    return this.cache.has(key); 
  } 

  set(key: K, value: V): void { 
    if (this.cache.has(key)) { 
      this.cache.delete(key); 
    } else if (this.cache.size === this.capacity) { 
      const leastRecentlyUsed = this.cache.keys().next(); 
      if (!leastRecentlyUsed.done) { 
        this.cache.delete(leastRecentlyUsed.value); 
      } 
    } 

    this.cache.set(key, value); 
  } 

  delete(key: K): boolean { 
    return this.cache.delete(key); 
  } 

  clear(): void { 
    this.cache.clear(); 
  } 
} 