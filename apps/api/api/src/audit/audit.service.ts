import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
  userId: number,
  action: string,
  endpoint: string,
  method: string,
  details?: string,
) {
  return this.prisma.auditLog.create({
    data: {
      userId,
      action,
      endpoint,
      method,
      details,
    },
  })
}
async findAll() {
  return this.prisma.auditLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}
async recent() {
  return this.prisma.auditLog.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

}