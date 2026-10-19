export {}; // Is file ko module banate hain, taaki global scope mein naam collision na ho.

// Yeh event handler ka type define karta hai, jo payload ko receive karta hai.
type EventHandler<T> = (payload: T) => void; // Handler ek function hai jo argument ke roop mein data leta hai.

// Yeh simple Pub/Sub implementation hai, jahan ek topic par multiple subscribers register ho sakte hain.
export class PubSub<T> { // Class ka naam PubSub hai, jisse events broadcast hoti hain.
  private subscribers = new Map<string, Set<EventHandler<T>>>(); // Har topic ke liye ek set rakha jata hai, taaki duplicate handlers na ho.

  // Yeh method ek topic par handler subscribe karta hai.
  subscribe(topic: string, handler: EventHandler<T>): () => void { // Subscribe karne par ek unsubscribe function return hota hai.
    if (!this.subscribers.has(topic)) { // Agar topic abhi register nahi hua hai, toh naya set bana dete hain.
      this.subscribers.set(topic, new Set()); // Har topic ke liye ek fresh empty set create hota hai.
    } // Topic set creation condition khatam hoti hai.

    const handlers = this.subscribers.get(topic)!; // Topic ka current handler set nikalte hain.
    handlers.add(handler); // Naya handler set mein add hota hai.

    return () => this.unsubscribe(topic, handler); // Unsubscribe karne ke liye function return hota hai.
  } // subscribe method khatam hota hai.

  // Yeh method ek topic se ek handler remove karta hai.
  unsubscribe(topic: string, handler: EventHandler<T>): void { // Topic aur handler ke basis par handler remove hota hai.
    const handlers = this.subscribers.get(topic); // Topic ke subscribers set ko fetch karte hain.
    if (!handlers) { // Agar subscribers maujood nahi hain, toh kuch karna zaroori nahi.
      return; // Function sirf return karta hai, without doing anything.
    } // Subscriber missing condition khatam hota hai.

    handlers.delete(handler); // Specific handler ko set se remove karte hain.
    if (handlers.size === 0) { // Agar topic ka koi subscriber nahi bacha, toh set ko clean kar dete hain.
      this.subscribers.delete(topic); // Topic ko map se remove kar diya jata hai.
    } // Empty set clean-up condition khatam hota hai.
  } // unsubscribe method khatam hota hai.

  // Yeh method ek topic par payload publish karta hai.
  publish(topic: string, payload: T): void { // Event ko trigger karne ke liye topic aur data diya jata hai.
    const handlers = this.subscribers.get(topic); // Topic ke current subscribers ko fetch karte hain.
    if (!handlers) { // Agar kisiko subscribe nahi kiya hai, toh publish bhi kuch nahi karta.
      return; // Function early return karta hai.
    } // No subscribers condition khatam hota hai.

    const snapshot = [...handlers]; // Iteration ke dauran modify na ho isliye copy lete hain.
    for (const handler of snapshot) { // Snapshot ke har subscriber ko call karte hain.
      handler(payload); // Har handler ko payload ke saath trigger karte hain.
    } // Subscriber loop khatam hota hai.
  } // publish method khatam hota hai.

  // Yeh method ek topic par sirf ek baar trigger hone wala handler register karta hai.
  once(topic: string, handler: EventHandler<T>): () => void { // Once handler sirf ek baar call hota hai.
    const unsubscribe = this.subscribe(topic, (payload) => { // Existing subscribe method ko wrap karke one-time behavior banate hain.
      unsubscribe(); // Jab handler call ho jaaye, tabhi unsubscribe karte hain.
      handler(payload); // Actual business logic ko call karte hain.
    }); // Wrapped handler define ho gaya.

    return unsubscribe; // Caller ko unsubscribe function return hota hai.
  } // once method khatam hota hai.

  // Yeh method dekhta hai ki ek topic par kitne subscribers active hain.
  size(topic: string): number { // Topic ke subscribers ki count return karta hai.
    return this.subscribers.get(topic)?.size ?? 0; // Agar topic absent ho, to 0 return hota hai.
  } // size method khatam hota hai.
} // PubSub class khatam hoti hai.














// Yeh demo ke liye ek PubSub object bana rahe hain.
const chatBus = new PubSub<string>(); // String messages ke liye bus create hua hai.

// Yeh first subscriber message ko console par print karta hai.
const unsubscribeA = chatBus.subscribe("chat", (message) => { // "chat" topic par first listener register hota hai.
  console.log(`Subscriber A: ${message}`); // Message ko A subscriber ke liye print karte hain.
}); // First subscriber khatam hota hai.

// Yeh second subscriber message ko console par print karta hai.
const unsubscribeB = chatBus.subscribe("chat", (message) => { // "chat" topic par second listener register hota hai.
  console.log(`Subscriber B: ${message}`); // Message ko B subscriber ke liye print karte hain.
}); // Second subscriber khatam hota hai.

// Yeh once subscriber sirf ek baar message ko consume karta hai.
const unsubscribeOnce = chatBus.once("chat", (message) => { // One-time listener register hota hai.
  console.log(`Subscriber Once: ${message}`); // Ek baar hi message print hota hai.
}); // Once subscriber khatam hota hai.

// Yeh publish message to all subscribers.
chatBus.publish("chat", "Hello from Pub/Sub"); // Topic par event trigger hota hai, sab listeners ko data milta hai.

// Yeh ek subscriber ko unsubscribe karte hain.
unsubscribeA(); // A subscriber ko remove kar dete hain.

// Yeh phir se message bhejte hain, jo remaining subscribers ko hi milega.
chatBus.publish("chat", "Second message"); // Topic par naya event trigger hota hai, sirf active listeners ko call hota hai.

// Yeh once handler bhi ek baar hi chala, isliye second publish par yeh nahi chalega.
chatBus.publish("chat", "Third message"); // Third event par once listener already removed ho chuka hai.

// Yeh current subscribers count print karta hai.
console.log(`Active subscribers for chat: ${chatBus.size("chat")}`); // Topic ke live listeners ki count print hoti hai.

// Yeh manual unsubscribe bhi call karte hain.
unsubscribeB(); // B subscriber ko remove karte hain.
unsubscribeOnce(); // Once subscriber ko bhi remove kar dete hain.

// Yeh final count print karta hai.
console.log(`Final subscribers for chat: ${chatBus.size("chat")}`); // Final remaining subscriber count dikhata hai.
