/*
 * Main server file for the application
 *
 * */

// Dependencies
const http = require('http')
const url = require("url")
const StringDecoder = require('string_decoder').StringDecoder

// HTTP port is either whatever is set in the environment variable `HTTP_PORT` or 3000 by default
const httpPort = process.env.httpPort || 3000

// create the http server
const httpServer = http.createServer(onCreateHttp)

// Callback for the http server
function onCreateHttp(req, res) {

    // if user sends a request with any or no request body to the "/hello" endpount,
    // they should get back a HTTP status OK (200) and a message equal to whatever they sent in the request payload.
    // They will also get back the querystrings that they send.
    // For all other routes, they should get back a NOT_FOUND (404) response with no response body

    // get the parsed url
    const parsedUrl = url.parse(req.url, true)

    // As the second argument in the parse method invocaion is true, req.query will now be an object which 
    // will have the querystring as a key-value pair
    // store the querystring
    const queryString = parsedUrl.query

    // store the method
    const method = req.method.toLowerCase()

    // store the path
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')

    // store the request body
    // the request body is going to be sent in chunks

    const decoder = new StringDecoder('utf-8')
    let body = ""

    req.on('data', (chunk) => {
        body += decoder.write(chunk)
    })

    req.on('end', function () {
        body += decoder.end();

        // determine the endpoint and call the appropriate handler for the routing
        const accessedRoute = (typeof router[path] !== 'undefined') ? router[path] : router['404']

        // send the data that is processed from the request, to the accessedRoute handler
        const data = {
            queryString,
            body
        }

        if(accessedRoute !== router['404']) {
            accessedRoute(req, res, data)
        }
        else {
            accessedRoute(res)
        }

    });

    // create the /hello route
}

// make the server listen to a port
httpServer.listen(httpPort, () => console.log(`HTTP Serevr is running on port: ${httpPort}`))

/* Router and Handlers */

// handlers provides the implementation or business logic for an endpoint
const handlers = {}

handlers.helloHandler = function (req, res, data) {
    // Tell the client that the response is in JSON
    res.setHeader("Content-Type", "application/json")

    // send the status code of 200
    res.writeHead(200)

    // create the response text
    const responseText = {
        responseMessage: {
            greeting: "Welcome!",
            queryString: data.queryString,
            body: data.body
        }
    }

    // write the response
    res.write(JSON.stringify(responseText))
    res.end()
}

handlers.notFound = function (res) {
    // fallback: NOT_FOUND (404) route
    // send the status code of 404
    res.writeHead(404)
    res.end()
}

// the router object, this acts like a controller for the http server
const router = {
    "hello": handlers.helloHandler,
    "404": handlers.notFound
}
