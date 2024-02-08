import * as http from 'node:http'
import process from 'node:process'
import fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cookie from '@fastify/cookie'
import { createPoll } from './routes/create.poll'
import { getOnePoll } from './routes/get.poll'
import { voteOnPoll } from './routes/vote.poll'
import { fastifyWebsocket } from '@fastify/websocket'
import { pollResults } from './ws/poll.result'

const app = fastify()
const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    app.server.emit('request', req, res)
})

app.register(cookie, {
    secret: 'vote-mamaefalei-bukele-zelensky',
    hook: 'onRequest',
    parseOptions: {}
})
app.register(fastifyWebsocket)

app.register(createPoll)
app.register(getOnePoll)
app.register(voteOnPoll)

app.register(pollResults)

app.get('/', (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Content-Type', 'text/plain');
    reply.header('Custom-Header', 'HelloHeader');
})

server.listen({ port: 3333 }, () => console.log('http server running'))

async function closeServer() {
    if (server) {
        return new Promise<void>((resolve) => {
        server.close(() => {
            console.log('HTTP server closed.');
            resolve();
          });
        });
    }    
}

function gracefulShutdown(event: string) {
    return async (code: any) => {
        console.log(`${event} received with ${code}`);
        await closeServer();
        process.exit(code);
    };
  }
    
  process.on('SIGINT', gracefulShutdown('SIGINT'));
  process.on('SIGTERM', gracefulShutdown('SIGTERM'));
    
  process.on('exit', (code) => {
      console.log('exit signal received', code);
  });
