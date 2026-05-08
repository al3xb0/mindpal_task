// Declare CSS files as side-effect modules so TypeScript accepts
// `import './globals.css'` without error (Next.js handles actual CSS processing).
declare module '*.css' {
  const content: Record<string, string>
  export default content
}
