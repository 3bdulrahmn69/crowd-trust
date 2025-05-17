const jsonServer = require('json-server');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const server = jsonServer.create();
const dbFile = path.join(__dirname, 'db.json');
let router = jsonServer.router(dbFile);
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Custom route
server.get('/unique-pledges', (req, res) => {
  const campaignId = parseInt(req.query.campaignId);
  if (!campaignId) {
    return res.status(400).json({ error: 'campaignId is required' });
  }

  const db = router.db; // lowdb instance
  const pledges = db.get('pledges').filter({ campaignId }).value();

  // Filter unique userId pledges
  const uniquePledges = Object.values(
    pledges.reduce((acc, pledge) => {
      if (!acc[pledge.userId]) {
        acc[pledge.userId] = pledge;
      }
      return acc;
    }, {})
  );

  res.jsonp(uniquePledges);
});

server.use((req, res, next) => {
  router(req, res, next);
});

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});

// 🔄 Watch db.json for changes
chokidar.watch(dbFile).on('change', () => {
  console.log('db.json has changed, reloading...');
  router = jsonServer.router(dbFile); // reload the router
});
