// Test admin API
fetch('http://localhost:3001/api/admin/orders', {
  headers: {
    'user': JSON.stringify({ id: '1', role: 'admin', name: 'Admin' })
  }
})
.then(res => res.json())
.then(data => console.log('Admin API Response:', data))
.catch(err => console.error('Error:', err));