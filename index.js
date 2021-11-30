const http = require('http')
const https = require('https')
const url = require('url');
const fs = require('fs');
const httpPort =  80
const httpsPort = 443
const mathOperation = {
    add: 'add',
    subtract: 'subtract',
    multiply: 'multiply',
    divide: 'divide'
}

const requestHandler = (req, res) => {
    switch (req.method) {
        case 'POST' : {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
                APIRequest(req, res, body.toString())
            })
            break;
        }
        case 'GET' : {
            APIRequest(req, res,'{}')
            break;
        }
        default : {
            APIRequest(req, res,'{}')
        }
    }

}



const APIRequest = (req, res, data) => {
    var contentType, contentTypeText, splittarr ;
    var url_parts = url.parse(req.url, true)
    var query = url_parts.pathname
    splittarr = query.split('/')
    splittarr =  splittarr.filter(e =>  e)
    switch (req.method) {
        case 'GET' : {
            contentType = {'Content-Type': 'text/plain'}
            contentTypeText = 'Content-Type: text/plain'
            break;
        }
        case 'POST': {
            try {
                data = JSON.parse(data)
            } catch (exp) {
                res.writeHead(400, contentType);
                res.end(JSON.stringify({
                    'result': '400: invalid Arguments, make sure the body is correct.'
                }))
                return;
            }
            contentType = { 'Content-Type': 'application/json'}
            if(splittarr.length !=0) {
                res.writeHead(404, contentType);
                res.end(JSON.stringify({
                    'result': '404: API endpoint not found.'
                }))
                return;
            }

            if (data['operation'] == undefined || data['arguments'] == undefined || data['arguments'].length !=2) {
                res.writeHead(400, contentType);
                res.end(JSON.stringify({
                    'result': '400: invalid Arguments, make sure the body is correct.'
                }))
                return;
            }
            splittarr = [data['operation'], data['arguments'][0], data['arguments'][1]]
            //res.writeHead(404, {'Content-Type': 'application/json'})
            //res.end(JSON.stringify({message: ''}))

            break;
        }
        default: {
            contentType = { 'Content-Type': 'application/json'}
            res.writeHead(405, contentType);
            res.end(JSON.stringify({
                'result': res.statusCode  + ' :' + res.statusMessage
            }))
            break;
        }

    }



    if  (splittarr.length == 3) {

        var a = parseInt(splittarr[1])
        var b = parseInt(splittarr[2])
        res.writeHead(200, contentType)
        var value;
        if(isNaN(a) || isNaN(b)) {
            res.writeHead(400,contentType)
            value  = '400: invalid Arguments, make sure the values and API end point is correct.'

        } else {

        switch (splittarr[0]) {
            case 'add' : {
                value = (a + b)
                break;
            }
            case 'multiply': {
                value = a * b
                break;
            }
            case 'divide': {
                if(b != 0) {
                    value = a / b
                } else {
                    res.writeHead(400, contentType)
                    value = '400: Invalid Math Operation. Cannot divide number by 0.'
                }
                break;
            }
            case 'subtract': {
                value = a - b;
                console.log(value)
                break;
            }
            default: {
                res.writeHead(400, contentType)
                value = '400: Invalid Math Operation. Available operations are [ add, multiply, divide, subtract].'
            }
        }

        }

        if(req.method == 'POST') {
            res.end(JSON.stringify({result: value}))
            return;
        } else if(req.method == 'GET') {
            //var response = 'HTTP/1.1 ' + res.statusCode +' ' + res.statusMessage +'\n' + contentTypeText + '\n' + '\n';
            res.end('' + value +'')
            return;
        }

        try {
        } catch (exp) {
            console.log(exp)
        }
    } else {
        res.writeHead(400,contentType)

        res.statusCode = 400
        //res.end('HTTP/1.1 ' + res.statusCode + ' ' + res.statusMessage + '\n' + contentTypeText + '\n\n400: Invalid URL')
        res.end('400: Invalid URL')
        return
    }

    // check if math operation matches
    if(mathOperation[splittarr[0]] == splittarr[0]) {
        console.log(splittarr[0])
        res.writeHead(404, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: query}))
        return;
    }

    res.writeHead(404, {'Content-Type': 'application/json'})
    res.end(JSON.stringify({message: query}))


}


const server = http.createServer(requestHandler)


const options = {
    key: fs.readFileSync("keys/localhost-key.pem"),
    cert: fs.readFileSync('keys/localhost.pem'),
};
const server1 = https.createServer(options, requestHandler )


server.listen(httpPort, () => {
    console.log(`listing on port ${httpPort} for http server`)
})



server1.listen(httpsPort, () => {
    console.log(`listing on port ${httpsPort} for https server`)
})