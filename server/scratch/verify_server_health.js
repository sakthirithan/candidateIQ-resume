const http = require('http');

http.get('http://localhost:5000/api/health', (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Health Check Response Status:', res.statusCode);
    console.log('Health Check Body:', body);
  });
}).on('error', (err) => {
  console.error('Health Check Error:', err.message);
});
