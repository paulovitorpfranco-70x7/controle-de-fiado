import { PrismaClient, PaymentMethod, SaleStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { login: "tonhao" },
    update: { passwordHash: "plain:tonhao123" },
    create: {
      name: "Tonhao",
      login: "tonhao",
      passwordHash: "plain:tonhao123",
      role: UserRole.OWNER
    }
  });

  const maria = await prisma.customer.upsert({
    where: { id: "seed-maria" },
    update: {},
    create: {
      id: "seed-maria",
      name: "Maria da Silva",
      phone: "(11) 98811-2201",
      phoneE164: "+5511988112201",
      address: "Rua das Flores, 188",
      creditLimitCents: 150000,
      notes: "Prefere pagar aos sabados."
    }
  });

  const joao = await prisma.customer.upsert({
    where: { id: "seed-joao" },
    update: {},
    create: {
      id: "seed-joao",
      name: "Joao Pereira",
      phone: "(11) 99755-6120",
      phoneE164: "+5511997556120",
      address: "Travessa do Mercado, 42",
      creditLimitCents: 120000
    }
  });

  await prisma.sale.upsert({
    where: { id: "sale-maria-1" },
    update: {},
    create: {
      id: "sale-maria-1",
      customerId: maria.id,
      description: "Compra de mercearia",
      originalAmountCents: 12000,
      feeAmountCents: 1800,
      finalAmountCents: 13800,
      remainingAmountCents: 5800,
      saleDate: new Date("2026-04-01T10:00:00.000Z"),
      dueDate: new Date("2026-04-12T23:59:59.000Z"),
      status: SaleStatus.PARTIAL,
      createdById: owner.id
    }
  });

  const payment = await prisma.payment.upsert({
    where: { id: "payment-maria-1" },
    update: {},
    create: {
      id: "payment-maria-1",
      customerId: maria.id,
      amountCents: 8000,
      paymentDate: new Date("2026-04-04T12:00:00.000Z"),
      method: PaymentMethod.PIX,
      notes: "Pagamento parcial",
      createdById: owner.id
    }
  });

  await prisma.paymentAllocation.upsert({
    where: { id: "allocation-maria-1" },
    update: {},
    create: {
      id: "allocation-maria-1",
      paymentId: payment.id,
      saleId: "sale-maria-1",
      amountCents: 8000
    }
  });

  await prisma.whatsAppMessage.upsert({
    where: { id: "wa-maria-1" },
    update: {},
    create: {
      id: "wa-maria-1",
      customerId: maria.id,
      saleId: "sale-maria-1",
      triggerType: "AUTO_3_DAYS",
      messageBody: "Maria, faltam 3 dias para o vencimento do seu fiado no Mercadinho do Tonhao.",
      sendStatus: "PENDING",
      scheduledFor: new Date("2026-04-09T12:00:00.000Z"),
      providerName: "mock",
      createdById: owner.id
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: owner.id,
      action: "seed_database",
      entityType: "system",
      entityId: "initial-seed",
      payloadJson: JSON.stringify({
        customers: [maria.id, joao.id]
      })
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
