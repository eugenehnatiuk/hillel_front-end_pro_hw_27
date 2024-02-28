import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateID = () => '_' + Math.random().toString(36).substring(2);

const server = fastify();
// GET
server.register(fastifyStatic, {
  root: join(__dirname, '../build'),
});

// POST
server.post('/users', async (request, reply) => {
  const userName = request.body.userName;
  const userID = generateID();

  reply.status(200).send({ userID, userName });
});

const wss = new WebSocketServer({ server: server.server });

wss.on('connection', (ws) => {
  console.log('WebSocket is connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    if (data.type && data.type === 'connected-user') {
      const connectedUser = data.user;
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ connectedUser }));
      });
      } else if (data.disconnectedUser) {
        const disconnectedUser = data.disconnectedUser;
        wss.clients.forEach((client) => {
          client.send(JSON.stringify({ disconnectedUser }));
        });
      } else {
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ ...data }));
      });
    }
  });
  
});

const port = process.env.PORT || 5000;
const host = process.env.HOST || '127.0.0.1';
server
  .listen({ port, host })
  .then((address) => {
    console.log(`Server was started at ${address}`);
  })
  .catch((err) => {
    console.error(`ATTENTION couldn't start the server: ${err}`);
  });

// server.listen({ port, host }, (err, address) => {
//   if (err) {
//     console.error('ATTENTION:', err);
//     return;
//   }
//   console.log('Server was started at ' + address);
// });
