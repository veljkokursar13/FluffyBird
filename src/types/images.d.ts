declare module '*.svg' {
  const content: number; // Metro returns a numeric module id for static assets
  export default content;
}


