require('dotenv').config({ path: '../prisma/.env' });
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Simple health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Service Orders
app.get('/service-orders', async (req, res) => {
  const orders = await prisma.serviceOrder.findMany({ include: { vehicle: { include: { customer: true } } } });
  res.json(orders);
});

app.post('/service-orders', async (req, res) => {
  const { title, description, price, vehicleId } = req.body;
  // basic validation: vehicleId is required and must exist
  if (!vehicleId) {
    return res.status(400).json({ error: 'vehicleId is required' });
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } });
    if (!vehicle) return res.status(400).json({ error: 'vehicleId does not exist' });

    const created = await prisma.serviceOrder.create({ data: { title, description, price: Number(price || 0), vehicleId: Number(vehicleId) } });
    res.json(created);
  } catch (err) {
    console.error('Failed to create service order:', err);
    // If Prisma error, return a 500 with limited info
    return res.status(500).json({ error: 'Failed to create service order' });
  }
});

// Inventory
app.get('/inventory', async (req, res) => {
  const items = await prisma.inventoryItem.findMany();
  res.json(items);
});

app.post('/inventory', async (req, res) => {
  const { name, sku, quantity, unitPrice } = req.body;
  const item = await prisma.inventoryItem.create({ data: { name, sku, quantity: Number(quantity || 0), unitPrice: unitPrice ? Number(unitPrice) : null } });
  res.json(item);
});

// Customers
app.get('/customers', async (req, res) => {
  const customers = await prisma.customer.findMany();
  res.json(customers);
});

// Vehicles
app.get('/vehicles', async (req, res) => {
  const vehicles = await prisma.vehicle.findMany();
  res.json(vehicles);
});

// Wash records
app.get('/wash-records', async (req, res) => {
  const records = await prisma.washRecord.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(records);
});

app.post('/wash-records', async (req, res) => {
  try {
    const { plate, washServiceId, washServiceName, employeeId, employeeName, value } = req.body;
    const created = await prisma.washRecord.create({ data: { plate, washServiceId: Number(washServiceId), washServiceName, employeeId: employeeId ? Number(employeeId) : null, employeeName, value: Number(value || 0) } });
    res.json(created);
  } catch (err) {
    console.error('Error creating wash record', err);
    res.status(500).json({ error: 'Failed to create wash record' });
  }
});

// Mark wash as completed
app.put('/wash-records/:id/complete', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const completedAt = new Date();
    const updated = await prisma.washRecord.update({ where: { id }, data: { completed: true, completedAt } });

    // create a transaction for the completed wash
    await prisma.transaction.create({ data: { type: 'sale', amount: Number(updated.value), note: `Wash ${updated.id} - ${updated.plate}` } });

    res.json(updated);
  } catch (err) {
    console.error('Error completing wash record', err);
    res.status(500).json({ error: 'Failed to complete wash record' });
  }
});

// Dashboard stats
app.get('/dashboard-stats', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const dailyRevenueAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: startOfDay }, type: 'sale' }
    });

    const monthlyRevenueAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: startOfMonth }, type: 'sale' }
    });

    const activeOS = await prisma.serviceOrder.count({ where: { status: { in: ['open','in_progress','assigned'] } } });
    const completedWashes = await prisma.washRecord.count({ where: { completed: true } });

    res.json({
      dailyRevenue: (dailyRevenueAgg._sum.amount || 0),
      monthlyRevenue: (monthlyRevenueAgg._sum.amount || 0),
      activeOS,
      completedWashes
    });
  } catch (err) {
    console.error('Error computing dashboard stats', err);
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
