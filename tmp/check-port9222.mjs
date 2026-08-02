import http from 'http'
const req = http.get('http://localhost:9222/json/version', (res) => {
  let d = ''
  res.on('data', c => (d += c))
  res.on('end', () => console.log(d))
})
req.on('error', e => console.log('PORT_9222_NOT_AVAILABLE:' + e.message))
req.setTimeout(3000, () => { console.log('TIMEOUT'); req.destroy() })