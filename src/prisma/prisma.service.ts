import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await this.clearDb();
      console.log('DB cleaned');
      await app.close();
    });
  }

  clearDb() {
    return this.$transaction([this.customer.deleteMany()]);
  }
}
