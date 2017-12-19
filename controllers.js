
'use strict'

var fs = require('fs');


/**
 * 
 * @param {*} router 
 * @param {*} mapping 
 */
function addMapping(router, mapping) {
    for (var url in mapping) {
        if (url.startsWith('GET ')) {
            router.get(url.substring(4), mapping[url]);
            console.log(`url GET: ${url}`);
        } else if (url.startsWith('POST ')) {
            router.post(url.substring(5), mapping[url]);
            console.log(`url POST: ${url}`);
        } else if (url.startsWith("DELETE ")) {
            router.delete(url.substring(7), mapping[url]);
            console.log(`url DELETE: ${url}`);
        } else if (url.startsWith('PUT ')) {
            router.put(url.substring(4), mapping[url]);
            console.log(`url PUT: ${url}`)
        } else {
            console.log(`url no method ${url}`)
        }
    }

}


/**
 * 
 * @param {*} router 
 * @param {*} dir 
 */
function addControllers(router, dir) {


    console.log('init controllers!');

    var pathname = __dirname + "\\" + dir;
    fs.readdirSync(pathname).filter((x) => { return x.endsWith('.js') }).forEach((f) => {
        //console.log(`process controller: ${x}...`);
        var file_name = __dirname + '/' + dir + '/' + f
        //获得mapping 
        /*
    { 'GET /': [AsyncFunction: fn_index] }
    { 'POST /sigin': [AsyncFunction: POST /sigin] }
         */
        let mapping = require(file_name);
        addMapping(router, mapping)
    });
}

module.exports = function (dir) {
    let
        controller_dir = dir || 'controller',
        router = require('koa-router')();
    addControllers(router, controller_dir);
    //添加router; app.use(router.routes())  
    return router.routes();
}





