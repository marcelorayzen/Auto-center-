const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@christocar.local' },
    update: {},
    create: { name: 'Admin', email: 'admin@christocar.local', role: 'admin' }
  });

  let customer = await prisma.customer.findFirst({ where: { email: 'joao@example.com' } });
  if (!customer) {
    customer = await prisma.customer.create({ data: { name: 'João Silva', phone: '11999990000', email: 'joao@example.com' } });
  } else {
    await prisma.customer.update({ where: { id: customer.id }, data: { phone: '11999990000' } });
  }

  const vehicle = await prisma.vehicle.upsert({
    where: { plate: 'ABC1234' },
    update: { model: 'VW Gol', color: 'Branco', customerId: customer.id },
    create: { plate: 'ABC1234', model: 'VW Gol', color: 'Branco', customerId: customer.id }
  });

  await prisma.serviceOrder.upsert({
    where: { id: 1 },
    update: {},
    create: { title: 'Troca de óleo', description: 'Trocar óleo e filtro', status: 'open', price: 150.0, vehicleId: vehicle.id }
  });

  await prisma.inventoryItem.upsert({
    where: { sku: 'OLEO-5W30' },
    update: { quantity: 10, unitPrice: 45.0 },
    create: { name: 'Óleo 5W-30', sku: 'OLEO-5W30', quantity: 10, unitPrice: 45.0 }
  });

  await prisma.transaction.create({ data: { type: 'sale', amount: 150.0, note: 'Pagamento troca de óleo' } }).catch(() => {});

  console.log('Seed completed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await (new PrismaClient()).$disconnect(); });
