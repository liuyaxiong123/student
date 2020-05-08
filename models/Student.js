const mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path'),
    nodeXlsx = require('node-xlsx');


//1.声明schema
let studentSchema = new mongoose.Schema({
    sid: Number, //学生的学号
    name: String, //名字
    sex: String, //性别
    age: Number //年龄    
});
//获取某一页学生数据
studentSchema.statics.findPageData = async function (page, callback) {
    //分页:
    let pageSize = 4; //一页4条数据
    let start = (page - 1) * pageSize; //起始位置
    let count = await this.find().countDocuments(); //获取数据总条数
    this.find({}).sort({ 'sid': -1 }).skip(start).limit(pageSize).exec(function (err, results) {
        if (err) {
            callback(null);
            return;
        }
        callback({
            results,
            count, //数据总条数
            length: Math.ceil(count / pageSize), //一共多少页
            now: page // 当前在那一页
        });
    })
}
//修改学生信息:
studentSchema.statics.changeStudent = function (sid, data, callback) {
    this.find({ sid }, (err, results) => {
        //console.log(results);
        var somebody = results[0];
        somebody.name = data.uname;
        somebody.sex = data.sex;
        somebody.age = data.age;
        somebody.save((err) => {
            if (err) {
                callback(-1); //修改失败
                return;
            }
            callback(1); //修改成功
        });
    });
}
//通过正则做模糊搜索
studentSchema.statics.findStudentNames = function (reg, callback) {
    //let val = new RegExp(reg,'g');
    //let val = eval(`/${reg}/g`);
    this.find(
        { name: { $regex: reg, $options: '$g' } },
        (err, results) => {
            if (err) {
                callback({ error: 0, data: null });
                return;
            }
            callback({ error: 1, data: results });
        }
    );
}
//将学生输出导出为excel表
studentSchema.statics.exportExcel = function (callback) {
    //查询所有学生数据:
    this.find({}, (err, results) => {
        if (err) {
            callback({ error: 0, msg: '数据查询失败' });
            return;
        }
        var datas = [
            // ['_id','sid','name','sex','age'],
            // ['sdfsd','100001','sdfs','女',19],
            // ['sdfsd','100001','sdfs','女',19]
        ]; //存储excel表的格式
        var col = ['_id', 'sid', 'name', 'sex', 'age']; //俗称列
        datas.push(col);
        //内容
        results.forEach(function (item) {
            var arrInner = [];
            arrInner.push(item._id);
            arrInner.push(item.sid);
            arrInner.push(item.name);
            arrInner.push(item.sex);
            arrInner.push(item.age);
            datas.push(arrInner);
        })
        //数组数据转换为底层excel表的二进制数据
        var buffer = nodeXlsx.build([
            { name: '1902', data: datas }, // 1个sheet
            // {name:'1906',data:datas} //可以有多个sheet
        ]);
        let urlLib = path.join(__dirname, '../');
        //console.log(`${urlLib}public/excel/banji.xlsx`);
        fs.writeFile(`${urlLib}public/excel/banji.xlsx`, buffer, { 'flag': 'w' }, function (err) {
            if (err) {
                callback({ error: 0, msg: 'excel导出失败' });
                return;
            }
            callback({ error: 1, msg: `banji.xlsx` });
        });
    })
}
//添加学生
studentSchema.statics.saveStudent = function (data, callback) {
    //查询表里所有sid字段 _id字段自动查询
    this.find({}, { sid: 1 }).sort({ sid: -1 }).limit(1).exec(function (err, results) {
        if (err) {
            callback({ error: 0, msg: '保存失败' });
            return;
        }
        //resutls : [{_id:23423,sid:11}]  data : {name:xxx,age:xxx,sex:xxx}
        let sid = results.length > 0 ? Number(results[0]['sid']) + 1 : 100001; //设置学号
        let student = new Student({
            ...data,
            sid
        });
        student.save(err => {
            if (err) {
                callback({ error: 0, msg: '保存失败' });
                return;
            }
            callback({ error: 1, msg: '保存成功' });
        })

    })
}
//删除学生
studentSchema.statics.deleteStudent = function (sid,callback){
    this.find({sid},(err,results)=>{
        //results [{_id:23423,name:xxx}]
        var somebody = results[0]; 
        somebody.remove(err=>{
            if(err){
                callback({error:0,msg:'删除失败'});
                return;
            }
            callback({error:1,msg:'删除成功'});
        });
    })
}
//2.初始化Student类 该类会声明一个名为students的集合
let Student = mongoose.model('Student', studentSchema);

//3.导出集合
module.exports = Student;