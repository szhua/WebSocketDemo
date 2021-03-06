'use strict';


var index = 0 ;

module.exports={
     'GET /signin':async(ctx,next)=>{
         let names ='甲乙丙丁戊己庚辛壬癸';
         let name =names[index%10] ;
         ctx.render('signin.html',{
             name : `路人:${name}`
         })
     },
     //登录
     'POST /signin':async(ctx,next)=>{
         index++ ;
         let name =ctx.request.body.name || '路人甲';
         let user ={
             id:index ,
             name :name ,
             img:index % 10 
         };
         //buffer ==>string=>base64   ||  buffer_from(base64)==>string
         let value =Buffer.from(JSON.stringify(user)).toString('base64');
         console.log(`set cookie value ${value}`) ;
         ctx.cookies.set('name',value) ;
         ctx.response.redirect('/'); 
     },
     //登出
     'GET /signout':async(ctx ,next)=>{
       ctx.cookies.set('name','');
       ctx.response.redirect('/signin'); 
     }


}



