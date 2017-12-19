'use strict'
//用于加载静态的文件；

const path =require('path') ;
const mime=require('mime');
const fs = require('mz/fs');

//url 类似于 /static /
// dir 类似于 _dirname +'/static/'+....
function staticFiles(url ,dir){
    return async function (ctx ,next){
      let rpath =ctx.request.path ;
      //以url 起始
      if(rpath.startsWith(url)){
         let fp =path.join(dir,rpath.substring(url.length));
        // console.log('***'+rpath);
     //    console.log(fp) ;
         if(await fs.exists(fp)){
             //TODO
             ctx.response.type =mime.lookup(fp) ;
               // 读取文件内容并赋值给response.body:
             ctx.response.body =await fs.readFile(fp); 
         }else{
             ctx.response.status  =404 ;
         }
      }else{
            // 不是指定前缀的URL，继续处理下一个middleware:
            await next() ;
      }
  }
}
module.exports =staticFiles 
