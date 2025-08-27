// // Edge-compatible Redis implementation
// // This is a simplified mock Redis implementation for Edge runtime

// const edgeMockRedis = {
//   get: async (key: string) => {
//     // For admin routes in development, return ADMIN role
//     if (key.endsWith(':role') && process.env.NODE_ENV === 'development') {
//       return 'ADMIN';
//     }
//     return null;
//   },
//   set: async (key: string, value: string, options?: any) => "OK",
//   del: async (key: string) => 1,
//   keys: async (pattern: string) => [],
//   incr: async (key: string) => 1,
//   expire: async (key: string, seconds: number) => 1,
//   ping: async () => "PONG",
// };

// export const edgeRedis = edgeMockRedis;