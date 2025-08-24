declare module '*.svg' {
  const content: number; // Metro returns a numeric module id for static assets
  export default content;
}

declare module '*.png' {
  const content: number;
  export default content;
}

declare module '*.webp' {
  const content: number;
  export default content;
}


