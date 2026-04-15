// Test order creation
fetch('http://localhost:3001/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'user': JSON.stringify({ id: '1', role: 'user', name: 'Test User' })
  },
  body: JSON.stringify({
    items: [
      { productId: 1, quantity: 2, price: 2000, size: "M" }
    ],
    totalAmount: 4000,
    address: "Lahore",
    paymentMethod: "COD"
  })
})
.then(res => res.json())
.then(data => console.log('Order Creation Response:', data))
.catch(err => console.error('Error:', err));