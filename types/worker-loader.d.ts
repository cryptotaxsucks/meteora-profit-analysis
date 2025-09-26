// types/worker-loader.d.ts

// Make imports like `import W from "@/workers/download.worker"` constructable
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

// Support the explicit loader form if ever used: `worker-loader!./x.worker.ts`
declare module "worker-loader!*" {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
