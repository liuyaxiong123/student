const mongoose = require('mongoose'),
      md5 = require('md5-node');

//1.声明schema
let adminSchema = new mongoose.Schema({
    username : String, //用户名
    password : String, //密码
    posttime : Number, //注册时间
    lastLoginTime : Number //最后一次登录时间
});
//处理登录:
adminSchema.statics.checkLogin = function (json,callback){
    this.checkUser(json.username,function (torf){
        //{username:xxxx,password:23ssfsa,posttime:234234,lastLoginTime:234234}
        if( torf.t ){ //用户名对了
            if( md5(json.password) == torf.val.password ){
                callback(1); //登录成功;
                //实例调用的方法是动态方法
                torf.val.changelastLoginTime();
                return;
            }
            callback(-1); //密码输入错误
        }else{
            callback(-2); //用户名不存在
        }
    })
}
//验证用户名是否存在
adminSchema.statics.checkUser = function (user,callback){
    this.find({'username':user},(err,results)=>{
        if( err ){
            callback({t:false,val:null});
            return;
        }
        if( results.length != 0 ){
            callback({t:true,val:results[0]});
            return;
        }
        callback({t:false,val:null});
    })
}
//修改用户登录成功以后的登录时间
adminSchema.methods.changelastLoginTime = function (){
    var timeStemp = new Date().getTime();
    this.lastLoginTime = timeStemp;
    this.save();
}

//2.初始化Admin类 该类会声明一个名为admins的集合
let Admin = mongoose.model('Admin',adminSchema);

//3.导出集合
module.exports = Admin;