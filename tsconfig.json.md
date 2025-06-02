{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext", "DOM"], // DOM is important if your number utilities interact with browser APIs
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": false,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true, // Essential for Vite/esbuild
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src", // The root of your source files
    "types": ["node"], // For Node.js specific globals in your build environment
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*.ts"], // Ensure all your TypeScript source files are included
  "exclude": ["node_modules", "dist"]
}