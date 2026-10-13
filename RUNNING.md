# Running standalone TypeScript files

Install the project dependencies once:

```powershell
npm install
```

Run any TypeScript (`.ts` or `.tsx`) file from the repository root with its
path:

```powershell
npm run run:file -- .\react\hoooks\useState.ts
```

Each invocation runs the specified file as its own entry point. Replace the
path with any other `.ts` or `.tsx` file you want to execute. Files with
imports can use other project files and installed dependencies as usual.
