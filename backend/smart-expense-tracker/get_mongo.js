const dns = require('dns');
const fs = require('fs');
dns.setServers(['8.8.8.8']);
dns.resolveSrv('_mongodb._tcp.cluster0.tx2vtks.mongodb.net', (e,a) => {
  if(e) return console.error(e);
  dns.resolveTxt('cluster0.tx2vtks.mongodb.net', (e2,a2) => {
    if(e2) return console.error(e2);
    const hosts = a.map(r => r.name + ':' + r.port).join(',');
    const txt = a2[0] ? a2[0].join('') : '';
    fs.writeFileSync('resolved_uri.txt', 'mongodb://' + hosts + '/?' + txt + '&ssl=true', 'utf8');
  });
});
