import { Server } from './server'
import { env } from "./utils";


const server = Server.createServer();
server.debug = true

server.get('/', ()=>{
    return {
        status: 200,
        send: {
            una: "vaina"
        }
    }
})

server.get('/', ()=>{
    return {
        status: 200,
        send: {
            una: "otra cosa"
        }
    }
})


server.listen(env.PORT, ()=>{
    console.log(`Server on port ${env.PORT}`)
})