'use strict'
const nunjucks = require('nunjucks');


/**
 * @param {*} path 
 * @param {*} options 
 * 创建numjucks的环境；
 */
function createEnv(path,options){
  var 
     autospace = options.autospace === undefined ? true :opts.autoescape,
     noCache   = options.noCache || false ,
     watch     = options.watch || false , 
     throwOnUndefined = options.throwOnUndefined || false,
     env =new nunjucks.Environment(
         new nunjucks.FileSystemLoader(
         path ||'views',{
             noCache:noCache,
             watch:watch 
         }
         ),
         {
             autoescape:autospace,
             watch :watch 
         }
     );  
    if(options.filters){
           for( var f of options.filters){
              env.addFilter(f,options.filters[f]) ;
           }
    }  

    return env ;
}


function templating(path ,options){
    var env =createEnv(path,options) ;
    return async (ctx ,next)=>{
        //为ctx创建 render函数：
        //RENDER的作用：
        //将body设置为nunjucks处理过的模板对象； 其中使用Object.assign（）将ctx的state和model进行属性的合并传递给view ;
        //此作用下只能够输出html对象
        console.log('add render');
        ctx.render= (view ,model)=>{
           ctx.response.body =env.render(view,Object.assign({}, ctx.state || {}, model || {}));
           ctx.response.type ='text/html';
        }   
        //绑定成功直接进行下一层操作
        await next() ; 
    }
}

//暴露函数
module.exports =templating



