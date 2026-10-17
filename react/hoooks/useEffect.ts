export {}; // Is file ko module banate hain, taaki doosri files ke functions se naam na takrayein

type EffectCallback = () => void | (() => void); // Effect callback kuch return na kare ya cleanup function de
type DependencyList = readonly unknown[]; // Dependencies ki list ko sirf read karne dete hain

type EffectRecord = { // Har useEffect hook ki information yahan store hoti hai
  dependencies: DependencyList | undefined; // Pichhli render ki dependencies yahan rehti hain
  hasRun: boolean; // Yeh batata hai ki effect pehle chal chuka hai ya nahi
  cleanup: (() => void) | undefined; // Pichhle effect ka cleanup function yahan rehta hai
  callback: EffectCallback; // Latest render wala effect callback yahan rehta hai
}; // Effect record ka type yahan khatam hota hai

const effects: EffectRecord[] = []; // Har hook ka record uske index par save karte hain
let effectCursor: number = 0; // Yeh track karta hai ki abhi kaunsa useEffect hook chal raha hai
let pendingEffects: number[] = []; // Render ke baad chalne wale effects ke indexes yahan jama hote hain

function myUseEffect(callback: EffectCallback, dependencies?: DependencyList): void { // useEffect ka simplified version yahan define hota hai
  const currentIndex = effectCursor; // Is effect ke liye current hook index lock karte hain
  let effect = effects[currentIndex]; // Is index ka pehle se saved effect record nikaalte hain

  if (effect === undefined) { // Agar yeh pehli render hai toh naya record banate hain
    effect = { dependencies, hasRun: false, cleanup: undefined, callback }; // Shuruati effect details set karte hain
    effects[currentIndex] = effect; // Naye record ko uske hook index par save karte hain
  } // Naya effect record banane wali condition yahan khatam hoti hai

  const previousDependencies = effect.dependencies; // Pichhli render ki dependencies sambhaal kar rakhte hain
  const dependenciesChanged = // Neeche check karte hain ki effect dobara chalna chahiye ya nahi
    dependencies === undefined || // Dependency list na ho toh har render par effect chalta hai
    previousDependencies === undefined || // Pichhli render par list na ho toh effect dobara chalta hai
    dependencies.length !== previousDependencies.length || // List ki length badle toh dependencies badli hain
    dependencies.some((dependency, index) => !Object.is(dependency, previousDependencies[index])); // Har value ko pichhli value se compare karte hain

  effect.callback = callback; // Record mein current render ka latest callback rakhte hain
  if (!effect.hasRun || dependenciesChanged) { // Pehli render ya dependency change par effect queue karte hain
    effect.dependencies = dependencies; // Current dependencies ko agli render ke liye save karte hain
    pendingEffects.push(currentIndex); // Effect ko render ke baad chalane ke liye queue karte hain
  } // Effect queue karne wali condition yahan khatam hoti hai

  effectCursor++; // Agle hook ke liye cursor ko aage badhaate hain
} // myUseEffect function yahan khatam hota hai

function flushEffects(): void { // Render complete hone ke baad queued effects chalate hain
  const effectsToRun = pendingEffects; // Is render ke effects ki copy lete hain
  pendingEffects = []; // Agli render ke liye pending list khaali karte hain

  for (const index of effectsToRun) { // Queue mein maujood har effect ko ek-ek karke chalate hain
    const effect = effects[index]; // Index se effect ka record nikaalte hain
    effect.cleanup?.(); // Purana cleanup ho toh naye effect se pehle chalate hain
    effect.cleanup = effect.callback() || undefined; // Effect chalakar naya cleanup function save karte hain
    effect.hasRun = true; // Record karte hain ki effect ab chal chuka hai
  } // Saare queued effects chalane ke baad loop yahan khatam hota hai
} // flushEffects function yahan khatam hota hai

function renderComponent(value: number): void { // Component render ka simplified example yahan dikhate hain
  effectCursor = 0; // Har render ke shuru mein hook cursor reset karte hain
  pendingEffects = []; // Is render ke effects ke liye queue khaali rakhte hain

  console.log(`Render -> Value: ${value}`); // Render mein current value console par dikhate hain

  myUseEffect(() => { // Component ke andar effect hook call karte hain
    console.log(`Effect ran for value: ${value}`); // Effect chalne par current value dikhate hain

    return () => { // Agli baar effect chalne se pehle cleanup function return karte hain
      console.log(`Cleanup for value: ${value}`); // Cleanup mein pichhli value dikhate hain
    }; // Cleanup function yahan khatam hota hai
  }, [value]); // Value badalne par effect chalane ke liye dependency dete hain

  flushEffects(); // Render ke baad queued effects ko chalate hain
} // renderComponent function yahan khatam hota hai

renderComponent(0); // Pehli render par effect chalta hai
renderComponent(1); // Value badalne par cleanup ke baad effect dobara chalta hai
renderComponent(1); // Value same hone par effect dobara nahi chalta
