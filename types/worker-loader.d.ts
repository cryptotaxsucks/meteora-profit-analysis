// types/worker-loader.d.ts

// Support importing workers WITH or WITHOUT the .ts/.js extension.
declare module "*.worker" {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
declare module "*.worker.ts" {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
declare module "*.worker.js" {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}

// Also support the explicit loader prefix form, if ever used.
declare module "worker-loader!*" {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
