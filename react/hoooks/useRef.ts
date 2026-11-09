



let cursor: number = 0;


const refs: { current: unknown }[] = [];


export function myUseRef<T>(initialValue: T): { current: T } {
  const hookIndex = cursor; 

  
  if (!(hookIndex in refs)) {
    refs[hookIndex] = { current: initialValue } as { current: unknown };
  }

  
  cursor++;

  
  return refs[hookIndex] as { current: T };
}


export function resetHookCursor(): void {
  cursor = 0;
}


function demo(): void {
  
  resetHookCursor();

  const countRef = myUseRef(0);
  const nameRef = myUseRef('Alice');

  console.log('First render ->', countRef.current, nameRef.current);

  
  countRef.current = 42;
  nameRef.current = 'Bob';

  
  resetHookCursor();
  const countRef2 = myUseRef(0); 
  const nameRef2 = myUseRef(''); 

  console.log('Second render ->', countRef2.current, nameRef2.current);
}

demo();
