import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// In Prisma 7, PrismaClient requires an adapter and is not easily subclassed.
// We create an instance and re-export it as the injectable service via a Proxy
// so that all model accessors (e.g. prisma.user) work transparently.
function createPrismaClient() {
  return new PrismaClient({ adapter });
}

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private _prisma: PrismaClientInstance;

  constructor() {
    this._prisma = createPrismaClient();

    // Return a proxy so that property access (e.g. this.user, this.organization)
    // is forwarded to the underlying PrismaClient instance.
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        return (target._prisma as any)[prop];
      },
    });
  }

  async onModuleInit() {
    await this._prisma.$connect();
  }

  async onModuleDestroy() {
    await this._prisma.$disconnect();
  }
}

// Merge the PrismaClient interface so consumers get full type-safety
export interface PrismaService extends PrismaClientInstance {}
