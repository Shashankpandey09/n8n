
import { PrismaClient } from '../generated/prisma/';

declare global {
  
  var __PRISMA_CLIENT__: PrismaClient | undefined;
}


const prisma = globalThis.__PRISMA_CLIENT__ ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__PRISMA_CLIENT__ = prisma;
}

export default prisma;
