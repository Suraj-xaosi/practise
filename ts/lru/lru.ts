// LRU ka matlab Least Recently Used hai: jagah kam padne par sabse purana use hua item nikalta hai.
// Map insertion order rakhta hai; get/set par item ko dobara daal kar use sabse recent banate hain.
export class LRUCache<K, V> { // Generic class hai, isliye key aur value ka type user choose kar sakta hai.
  private readonly cache = new Map<K, V>(); // Cache ke items insertion order mein rakhe jaate hain.

  constructor(private readonly capacity: number) { // Constructor cache ki maximum capacity leta hai.
    if (!Number.isInteger(capacity) || capacity < 1) { // Capacity positive integer na ho to error dete hain.
      throw new RangeError("capacity must be a positive integer"); // Galat capacity ke saath cache banana rok dete hain.
    } // Capacity validation yahan khatam hoti hai.
  } // Constructor yahan khatam hota hai.

  get size(): number { // Cache mein maujood items ki sankhya deta hai.
    return this.cache.size; // Map ke andar items ki current count lautate hain.
  } // Size getter yahan khatam hota hai.

  get(key: K): V | undefined { // Key se value nikalta hai aur na mile to undefined deta hai.
    if (!this.cache.has(key)) { // Key cache mein hai ya nahi check karte hain.
      return undefined; // Key na mile to kuch value nahi lautate.
    } // Missing key ka check yahan khatam hota hai.

    const value = this.cache.get(key)!; // Maujood key ki value nikalte hain.
    this.cache.delete(key); // Key ko purani position se hata kar uski recency reset karte hain.
    this.cache.set(key, value); // Key ko end mein daal kar sabse recently used banate hain.
    return value; // Mili hui value caller ko lautate hain.
  } // Get method yahan khatam hota hai.

  has(key: K): boolean { // Batata hai ki cache mein yeh key maujood hai ya nahi.
    return this.cache.has(key); // Map ka key-existence result seedha lautate hain.
  } // Has method yahan khatam hota hai.

  set(key: K, value: V): void { // Cache mein key-value jodta hai ya purani value update karta hai.
    if (this.cache.has(key)) { // Key pehle se ho to uski purani position hataate hain.
      this.cache.delete(key); // Dobara add karne se key recent position par aa jayegi.
    } else if (this.cache.size === this.capacity) { // Nayi key ho aur cache full ho to jagah banate hain.
      const leastRecentlyUsed = this.cache.keys().next(); // Map ki pehli key sabse kam recent item hoti hai.
      if (!leastRecentlyUsed.done) { // Iterator se key mili ho tabhi usse remove karte hain.
        this.cache.delete(leastRecentlyUsed.value); // Sabse kam recent item ko cache se nikalte hain.
      } // Eviction ka check yahan khatam hota hai.
    } // Existing key update ya full-cache eviction yahan khatam hota hai.

    this.cache.set(key, value); // Nayi ya updated value ko recent position par rakhte hain.
  } // Set method yahan khatam hota hai.

  delete(key: K): boolean { // Di hui key ko cache se remove karne ki koshish karta hai.
    return this.cache.delete(key); // Key remove hui ho to true, warna false lautata hai.
  } // Delete method yahan khatam hota hai.

  clear(): void { // Cache ke saare items hata deta hai.
    this.cache.clear(); // Map ko khaali karte hain.
  } // Clear method yahan khatam hota hai.
} // LRUCache class yahan khatam hoti hai.