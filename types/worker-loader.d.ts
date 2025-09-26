// types/worker-loader.d.ts
declare module "*.worker.ts" {
  const WorkerFactory: { new (): Worker };
  export default WorkerFactory;
}
declare module "worker-loader!*" {
  const WorkerFactory: { new (): Worker };
  export default WorkerFactory;
}
