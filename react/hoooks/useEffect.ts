export {}; 

type EffectCallback = () => void | (() => void); 
type DependencyList = readonly unknown[]; 

type EffectRecord = { 
  dependencies: DependencyList | undefined; 
  hasRun: boolean; 
  cleanup: (() => void) | undefined; 
  callback: EffectCallback; 
}; 

const effects: EffectRecord[] = []; 
let effectCursor: number = 0; 
let pendingEffects: number[] = []; 

function myUseEffect(callback: EffectCallback, dependencies?: DependencyList): void { 
  const currentIndex = effectCursor; 
  let effect = effects[currentIndex]; 

  if (effect === undefined) { 
    effect = { dependencies, hasRun: false, cleanup: undefined, callback }; 
    effects[currentIndex] = effect; 
  } 

  const previousDependencies = effect.dependencies; 
  const dependenciesChanged = 
    dependencies === undefined || 
    previousDependencies === undefined || 
    dependencies.length !== previousDependencies.length || 
    dependencies.some((dependency, index) => !Object.is(dependency, previousDependencies[index])); 

  effect.callback = callback; 
  if (!effect.hasRun || dependenciesChanged) { 
    effect.dependencies = dependencies; 
    pendingEffects.push(currentIndex); 
  } 

  effectCursor++; 
} 

function flushEffects(): void { 
  const effectsToRun = pendingEffects; 
  pendingEffects = []; 

  for (const index of effectsToRun) { 
    const effect = effects[index]; 
    effect.cleanup?.(); 
    effect.cleanup = effect.callback() || undefined; 
    effect.hasRun = true; 
  } 
} 

function renderComponent(value: number): void { 
  effectCursor = 0; 
  pendingEffects = []; 

  console.log(`Render -> Value: ${value}`); 

  myUseEffect(() => { 
    console.log(`Effect ran for value: ${value}`); 

    return () => { 
      console.log(`Cleanup for value: ${value}`); 
    }; 
  }, [value]); 

  flushEffects(); 
} 

renderComponent(0); 
renderComponent(1); 
renderComponent(1); 
