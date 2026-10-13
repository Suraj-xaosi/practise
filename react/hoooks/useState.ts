// React ke internal Fiber structure ka ek bohot hi simplified version
let states: unknown[] = []; // Linked list ki jagah yahan array use kar rahe hain
let cursor: number = 0;  // Yeh track rakhta hai ki kaun sa hook chal raha hai

function myUseState<T>(initialValue: T): [T, (newValue: T) => void] {
  const currentCursor = cursor; // Is specific hook ka index lock kar lo

  // Agar state pehle se nahi hai (First Render / Mount), toh initial value set karo
  if (!(currentCursor in states)) {
    states[currentCursor] = initialValue;
  }

  // Setter function jo internally us specific index ko update karega
  const setState = (newValue: T): void => {
    states[currentCursor] = newValue;
    triggerRender(); // State badalne par re-render chalao
  };

  cursor++; // Agle hook ke liye cursor ko badhao
  return [states[currentCursor] as T, setState];
}

// Render simulation function
function renderComponent(): void {
  cursor = 0; //  SABSE ZAROORI: Har render ke shuru mein cursor reset hoga!
  
  // Maan lo yeh aapka React component hai
  const [count, setCount] = myUseState(0);     // Hook 0
  const [name, setName] = myUseState("suraj");  // Hook 1

  console.log(`Render -> Count: ${count}, Name: ${name}`);

  //  Ek baar count badhate hain
  if (count === 0) {
    setCount(1); 
  }
}

function triggerRender(): void {
  renderComponent();
}

// Pehla render
renderComponent();
