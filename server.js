const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
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

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});
