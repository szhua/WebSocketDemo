'use strict'

const url = require('url');
const Koa = require('koa');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const Cookies = require('cookies');
const bodyParser = require('koa-bodyparser');
const controller = require('./controllers');
const staticfiles = require('./static_files');
const templating = require('./templating');

const app = new Koa();

//执行logger 
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
})


app.use(async (ctx, next) => {
    //设置state.user !! ()      
    ctx.state.user = parseUser(ctx.cookies.get('name'));
    await next();
});


app.use(staticfiles('/static/', __dirname + '/static'))

app.use(bodyParser());

app.use(templating('views', {
    noCache: true,
    watch: true
}));

app.use(controller('controller'));

let server = app.listen(3000);



function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
    let wss = new WebSocketServer({
        server: server
    });
    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };
    onConnection = onConnection || function () {
        console.log('[WebSocket] connected.');
    };
    onMessage = onMessage || function (msg) {
        console.log('[WebSocket] message received: ' + msg);
    };
    onClose = onClose || function (code, message) {
        console.log(`[WebSocket] closed: ${code} - ${message}`);
    };
    onError = onError || function (err) {
        console.log('[WebSocket] error: ' + err);
    };
    wss.on('connection', function (ws) {
        let location = url.parse(ws.upgradeReq.url, true);
        console.log('[WebSocketServer] connection: ' + location.href);
        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);
        if (location.pathname !== '/ws/chat') {
            // close ws:
            ws.close(4000, 'Invalid URL');
        }
        // check user:
        let user = parseUser(ws.upgradeReq);

        
        if (!user) {
            ws.close(4001, 'Invalid user');}


        ws.user = user;
        ws.wss = wss;
        onConnection.apply(ws);
    });
    console.log('WebSocketServer was attached.');
    return wss;
}

var messageIndex = 0;

function createMessage(type, user, data) {
    messageIndex ++;
    return JSON.stringify({
        id: messageIndex,
        type: type,
        user: user,
        data: data
    });
}



app.wss =createWebSocketServer(server,onConnect,onMessage,onClose);


function parseUser(object) {
    if (!object) { return; }
    let s = '';
    console.log('try parse object json !!')
    //为string的情况下
    if (typeof object === 'string') {
        s = object;
        //TODO  若是一个cookie对象的情况;
    } else if (object.headers) {
        let cookies = new Cookies(object, null);
        s = cookies.get('name');
    }else{
        console.error('不知道啥情况');
    }

    if (s) {
        try {
            //解析user ;
            let user = JSON.parse(Buffer.from(s, 'base64').toString());
            console.log(`User: ${user.name}---${user.id}`);
            return user;
        } catch (error) {
            console.error(error);
        }
    }
}


var messageIndex = 0;

function createMessage(type, user, data) {
    messageIndex++;
    return JSON.stringify({
        id: messageIndex,
        type: type,
        user: user,
        data: data
    });
}

function onConnect() {

    let user = this.user;

    let msg = createMessage('join', user, `${user.name} joined.`);
    this.wss.broadcast(msg);
    // build user list:
    let users = this.wss.clients.map(function (client) {
        return client.user;
    });
    this.send(createMessage('list', user, users));
}

function onMessage(message) {
    console.log(message);
    if (message && message.trim()) {
        let msg = createMessage('chat', this.user, message.trim());
        this.wss.broadcast(msg);
    }
}

function onClose() {
    let user = this.user;
    let msg = createMessage('left', user, `${user.name} is left.`);
    this.wss.broadcast(msg);
}