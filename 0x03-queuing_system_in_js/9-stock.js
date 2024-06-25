const redis = require('redis');
const { promisify } = require('util');
const express = require('express');

const app = express();
const port = 1245;

// Redis client setup
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Data: List of products
const listProducts = [
  { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
  { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
  { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
  { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 }
];

// Function to get item by id
function getItemById(id) {
  return listProducts.find(item => item.itemId === id);
}

// Reserve stock function
async function reserveStockById(itemId, stock) {
  await setAsync(`item.${itemId}`, stock);
}

// Function to get current reserved stock by id
async function getCurrentReservedStockById(itemId) {
  const reservedStock = await getAsync(`item.${itemId}`);
  return parseInt(reservedStock) || 0;
}

// Routes
app.get('/list_products', (req, res) => {
  res.json(listProducts.map(item => ({
    itemId: item.itemId,
    itemName: item.itemName,
    price: item.price,
    initialAvailableQuantity: item.initialAvailableQuantity
  })));
});

app.get('/list_products/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const product = getItemById(itemId);

  if (!product) {
    return res.json({ status: "Product not found" });
  }

  const currentReserved = await getCurrentReservedStockById(itemId);
  const currentQuantity = product.initialAvailableQuantity - currentReserved;

  res.json({
    itemId: product.itemId,
    itemName: product.itemName,
    price: product.price,
    initialAvailableQuantity: product.initialAvailableQuantity,
    currentQuantity: currentQuantity
  });
});

app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const product = getItemById(itemId);

  if (!product) {
    return res.json({ status: "Product not found" });
  }

  const currentReserved = await getCurrentReservedStockById(itemId);
  const currentAvailable = product.initialAvailableQuantity - currentReserved;

  if (currentAvailable <= 0) {
    return res.json({ status: "Not enough stock available", itemId });
  }

  await reserveStockById(itemId, currentReserved + 1);

  res.json({ status: "Reservation confirmed", itemId });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
