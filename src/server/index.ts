import { createServer, IncomingMessage,  Server as HttpServer, ServerResponse } from 'http'

type KeyValueString = {
    [key: string]: string
}

type Query = KeyValueString
type Headers = KeyValueString


type HttpMethods = 'GET' | 'POST' | 'PATCH' | 'DELETE' 

interface Request {
    headers: Headers,
    query: Query,
    path: string,
    accept: string,
    connection: string,
    cookies: string,
    method: HttpMethods
}

type Send = Object | string | []
type IResponse = {
    status: number,
    send: Send
}
type Response = IResponse  | Promise<IResponse> | undefined | null
type ControllerHandler = (req: Request)=>Response

interface Controller {
    path: string,
    handler: ControllerHandler,
    method: HttpMethods
}

export class Server {
    #server:HttpServer
    static instance: Server
    #controllers: Controller[] = []
    debug: boolean = false

    #isListening:boolean = false

    constructor(){
        this.#server = createServer((req, res)=>this.#runControllers(req, res))
    }

    #parseRequest(req: IncomingMessage):Request{
        const { headers, method } = req as {headers: Headers, method: HttpMethods}
        const { pathname: path, searchParams } = new URL(!req.url.includes('http')?`http://example.example${req.url}`: req.url)
        let query:Query = {}
        searchParams.forEach((v, k)=>query[k] = v)
        return {
            query,
            path,
            headers,
            accept: headers.accept,
            connection: headers.connection,
            cookies: headers.cookie,
            method,
        }
    }

    #parseSend(send: Object | string | []):string{
        if(typeof send === 'object' && !!send){
            return JSON.stringify(send)
        }
        else if(typeof send !== 'string'){
            return `${send}`
        }
        return send
    }

    #printDebug(req: Request, res: {status: number }){
        if(!this.debug) return;
        console.log(`${req.method} ${req.path} -> statusCode: ${res.status}`)
    }


    async #executeController(req: Request, res: ServerResponse, controller: Controller){
        let response:Response = await controller.handler(req)
        this.#printDebug(req, response)
        if(!response) response = { status: 200, send: '' }
        res.statusCode = response.status
        let send: string = this.#parseSend(response.send)
        return res.end(send)
    }

    async #runControllers(req: IncomingMessage, res: ServerResponse){
        const request = this.#parseRequest(req)
        const controllers = this.#controllers.reverse()
        for(const controller of controllers){
            if(controller.path === request.path && controller.method === request.method){
                return await this.#executeController(request, res, controller)
            }
        }
        this.#printDebug(request, {status: 404})
        res.statusCode = 404
        return res.end()
    }

    #checkAddRouteAfterListening(){
        if(this.#isListening) throw new Error('Cannot set a route after listening')
    }

    startDebugging(){
        this.debug = true
    }

    get(path: string, handler: ControllerHandler){
        this.#checkAddRouteAfterListening()
        this.#controllers.push({
            path,
            handler,
            method: 'GET'
        })
    }

    post(path: string, handler: ControllerHandler){
        this.#checkAddRouteAfterListening()
        this.#controllers.push({
            path,
            handler,
            method: 'POST'
        })
    }

    patch(path: string, handler: ControllerHandler){
        this.#checkAddRouteAfterListening()
        this.#controllers.push({
            path,
            handler,
            method: 'PATCH'
        })
    }

    delete(path: string, handler: ControllerHandler){
        this.#checkAddRouteAfterListening()
        this.#controllers.push({
            path,
            handler,
            method: 'DELETE'
        })
    }

    listen(port: number, listener: ()=>void){
        this.#server.listen(port, ()=>{
            listener()
            this.#isListening = true
        })
    }

    static createServer():Server{
        if(!this.instance){
            this.instance = new Server()
            return this.instance
        }
        return this.instance
    }
}


