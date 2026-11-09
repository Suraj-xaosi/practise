
let states: unknown[] = []; 
let cursor: number = 0;  

function myUseState<T>(initialValue: T): [T, (newValue: T) => void] {
  const currentCursor = cursor; 

  
  if (!(currentCursor in states)) {
    states[currentCursor] = initialValue;
  }

  
  const setState = (newValue: T): void => {
    states[currentCursor] = newValue;
    triggerRender(); 
  };

  cursor++; 
  return [states[currentCursor] as T, setState];
}


function renderComponent(): void {
  cursor = 0; 
  
  
  const [count, setCount] = myUseState(0);     
  const [name, setName] = myUseState("suraj");  

  console.log(`Render -> Count: ${count}, Name: ${name}`);

  
  if (count === 0) {
    setCount(1); 
  }
}

function triggerRender(): void {
  renderComponent();
}


renderComponent();
