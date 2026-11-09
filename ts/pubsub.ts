export {}; 


type EventHandler<T> = (payload: T) => void; 


export class PubSub<T> { 
  private subscribers = new Map<string, Set<EventHandler<T>>>(); 

  
  subscribe(topic: string, handler: EventHandler<T>): () => void { 
    if (!this.subscribers.has(topic)) { 
      this.subscribers.set(topic, new Set()); 
    } 

    const handlers = this.subscribers.get(topic)!; 
    handlers.add(handler); 

    return () => this.unsubscribe(topic, handler); 
  } 

  
  unsubscribe(topic: string, handler: EventHandler<T>): void { 
    const handlers = this.subscribers.get(topic); 
    if (!handlers) { 
      return; 
    } 

    handlers.delete(handler); 
    if (handlers.size === 0) { 
      this.subscribers.delete(topic); 
    } 
  } 

  
  publish(topic: string, payload: T): void { 
    const handlers = this.subscribers.get(topic); 
    if (!handlers) { 
      return; 
    } 

    const snapshot = [...handlers]; 
    for (const handler of snapshot) { 
      handler(payload); 
    } 
  } 

  
  once(topic: string, handler: EventHandler<T>): () => void { 
    const unsubscribe = this.subscribe(topic, (payload) => { 
      unsubscribe(); 
      handler(payload); 
    }); 

    return unsubscribe; 
  } 

  
  size(topic: string): number { 
    return this.subscribers.get(topic)?.size ?? 0; 
  } 
} 















const chatBus = new PubSub<string>(); 


const unsubscribeA = chatBus.subscribe("chat", (message) => { 
  console.log(`Subscriber A: ${message}`); 
}); 


const unsubscribeB = chatBus.subscribe("chat", (message) => { 
  console.log(`Subscriber B: ${message}`); 
}); 


const unsubscribeOnce = chatBus.once("chat", (message) => { 
  console.log(`Subscriber Once: ${message}`); 
}); 


chatBus.publish("chat", "Hello from Pub/Sub"); 


unsubscribeA(); 


chatBus.publish("chat", "Second message"); 


chatBus.publish("chat", "Third message"); 


console.log(`Active subscribers for chat: ${chatBus.size("chat")}`); 


unsubscribeB(); 
unsubscribeOnce(); 


console.log(`Final subscribers for chat: ${chatBus.size("chat")}`); 
