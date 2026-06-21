import { Module } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { TransactionController } from './transaction.controller'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService,PrismaService, AuditService], // 🔥 TAMBAH INI
})
export class TransactionModule {}