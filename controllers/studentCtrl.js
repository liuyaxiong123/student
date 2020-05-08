const Student = require('../models/Student'),
    Admin = require('../models/Admin'),
    formidable = require('formidable');
    

//渲染首页 (包含管理员信息)
exports.showIndex = function (req, res) {
    Admin.checkUser(req.session.s_id, function (adminR) {       
        res.render('index', {
            adminData: adminR
        });     
    })
}
//访问接口 获取学生某一页数据
exports.showList = function (req,res){
    let page = req.query.page ? req.query.page : 1; //获取页数
    Student.findPageData(page,function (results){
        res.json(results);
    });
}
//访问接口 处理修改学生数据
exports.updateStudent = function (req,res){
    let sid = req.params.sid;
    let form = formidable();
    form.parse(req,(err,fields)=>{
        Student.changeStudent(sid,fields,(results)=>{
            res.json({error:results});
        });
    })
}
//通过学生姓名做模糊搜索
exports.searchStudent = function (req,res){
    let search = req.query.search;
    Student.findStudentNames(search,(results)=>{
        res.json(results);
    });
}
//访问接口 处理学生数据导出
exports.exportStudentToExcel = function (req,res){
    
    Student.exportExcel((data)=>{
        res.send(data);
    });
}
//访问增加学生页面
exports.showAddStudent = function (req,res){
    Admin.checkUser(req.session.s_id, function (adminR) {       
        res.render('addStudent', {
            adminData: adminR
        });     
    })
}
//访问接口 处理增加学生
exports.addStudent = function (req,res){
    let form = formidable();
    form.parse(req,(err,fields)=>{
        if( err ){
            res.json({error:0,msg:'数据接收失败'});
            return;
        }
        
        Student.saveStudent(fields,(results)=>{            
            res.json(results);
        });
    })
}
//访问接口 处理删除学生
exports.deleteStudent = function (req,res){
    ///student/:sid
    let sid = req.params.sid;
    
    Student.deleteStudent(sid,(results)=>{
        res.json(results);
    });
}