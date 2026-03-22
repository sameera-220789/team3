const http = require('http');

const data = JSON.stringify({
  userId: "64b0f2d9e61c770012345678",
  category: "total",
  limit: 5000
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/budgets',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
