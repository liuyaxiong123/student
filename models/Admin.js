const mongoose = require('mongoose');


// 1.声明schema
let adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  posttime: Number,
  lastLoginTime: Number,
});

// 2.初始化Admin类 该类会声明一个名为admins的集合
let Admin = mongoose.model('Admin', adminSchema);
// 3.导出集合
module.exports = Admin;