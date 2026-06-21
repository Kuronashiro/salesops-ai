import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /* ================= SUMMARY ================= */
  async getSummary(startDate?: string, endDate?: string) {
  const where: any = {};
    const auditLogs =
  await this.prisma.auditLog.count();
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  // ✅ CURRENT DATA
  const current = await this.prisma.transaction.findMany({ where });

  const currentRevenue = current.reduce((sum, t) => sum + t.amount, 0);

  // ================= PREVIOUS PERIOD =================

  let previousRevenue = 0;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = end.getTime() - start.getTime();

    const prevStart = new Date(start.getTime() - diff);
    const prevEnd = new Date(start.getTime());

    const previous = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: prevStart,
          lte: prevEnd,
        },
      },
    });

    previousRevenue = previous.reduce((sum, t) => sum + t.amount, 0);
  }

  // ================= GROWTH =================

  let growth = 0;

  if (previousRevenue > 0) {
    growth =
      ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  }

  // ================= TOP PRODUCT =================

  const productMap: Record<string, number> = {};

  for (const t of current) {
    productMap[t.productName] = (productMap[t.productName] || 0) + t.amount;
  }

  let topProduct: string | null = null;
  let max = 0;

  for (const productName in productMap) {
    if (productMap[productName] > max) {
      max = productMap[productName];
      topProduct = productName;
    }
  }

  return {
    totalRevenue: currentRevenue,
    totalTransactions: current.length,
    topProduct,
    growth: Number(growth.toFixed(1)), // 🔥 NEW
    auditLogs,
  };
}

  /* ================= SALES BY MONTH ================= */
  async getSalesByMonth(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    const transactions = await this.prisma.transaction.findMany({ where });

    const result: any = {};

    transactions.forEach((t) => {
      const date = new Date(t.createdAt);
      const monthIndex = date.getMonth();
      const monthName = date.toLocaleString('default', { month: 'short' });

      if (!result[monthIndex]) {
        result[monthIndex] = { month: monthName, revenue: 0 };
      }

      result[monthIndex].revenue += t.amount;
    });

    return Object.keys(result)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => result[key]);
  }

  /* ================= TOP PRODUCTS ================= */
  async getTopProducts(startDate?: string, endDate?: string, mode: string = "revenue") {
  let where: any = {};

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const transactions = await this.prisma.transaction.findMany({
    where,
  });

  const productMap: Record<string, number> = {};

  for (const t of transactions) {
    if (!(t.productName in productMap)) {
  productMap[t.productName] = 0;
}

    if (mode === "price") {
      // ambil harga tertinggi
      productMap[t.productName] = Math.max(productMap[t.productName], t.price);

    } else if (mode === "quantity") {
      // jumlah transaksi
      productMap[t.productName] += 1;

    } else {
      // default: revenue
      productMap[t.productName] += t.price * t.amount;
    }
  }

  return Object.keys(productMap)
    .map((productName) => ({
      name: productName,
      value: productMap[productName],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}}