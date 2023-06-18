const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app)
const {Server} = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser')
const mysql = require('mysql');
 var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "",
    database : "pmt"
});
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/Home',(req,res)=>{
    res.sendFile("pages/index.html",{root:__dirname});
    app.use(express.static('pages'));
})
app.get('/Auth/User',(req,res)=>{
    res.sendFile("pages/uerlogin.html",{root:__dirname});
    app.use(express.static('pages'));
})
con.query("SELECT userUsername,UserPassword FROM user",(err,result,field)=>{
    if(err)throw err
    var userDatabase = JSON.parse(JSON.stringify(result))
    console.log(userDatabase);
    app.post('/login-user',(req,res)=>{
        let userUserName = req.body.UserName;
        let userPassword = req.body.password
       var match  = "SELECT userUsername , UserPassword FROM user WHERE ?" ;
       var condition = [ userUsername =  `${userUserName}`];
       con.query(match,[condition],(err,result)=>{
        if(err) throw err;
        else{
            res.redirect('/dashboard')
        }
       })
    })
})
app.get('/Auth',(req,res)=>{
    res.sendFile("pages/adminLogin.html",{root:__dirname});
    app.use(express.static('pages'));
});
con.query("SELECT username,password FROM admin",(err,result,field)=>{
    if(err)throw err
    var data = JSON.parse(JSON.stringify(result));
app.post("/login",(req,res)=>{
    let user = req.body.username;
    let pass= req.body.password;
    if(data[0].username == user && data[0].password == pass ){
            res.redirect('/dashboard');
        }
    else{
        res.redirect('/login-failed')
    }
    })
})
app.get('/register',(req,res)=>{
    res.sendFile('pages/userresister.html',{root:__dirname});
    app.use(express.static('pages'))
})
app.post('/login-register',(req,res)=>{
  let regUsr = req.body.regName;
  let rePass = req.body.regPassword;
  var insertData = "INSERT INTO  user (userUsername, UserPassword) VALUES ?";
  var values = [
    [`${regUsr}`,`${rePass}`]
  ]
  con.query(insertData,[values],function(err,result){
    if(err) throw err
    res.redirect('/dashboard')
  })  
})
app.get("/dashboard",(req,res)=>{
    res.sendFile('pages/dashbord.html',{root:__dirname});
    app.use(express.static('pages'))
    io.on("connection", function(socket){
        socket.on("user_join",function(data){
            this.username = data;
            socket.broadcast.emit("user_join",data);
        });
        socket.on("chat_message",function(data){
            data.username = this.username;
            socket.broadcast.emit("chat_message",data);
        });
        socket.on("disconect",function(data){
            socket.broadcast.emit("user_leave",this.username);
        });
    });
});
app.get('/tasks',(req,res)=>{
    res.sendFile('pages/task.html',{root:__dirname})
    app.use(express.static('pages'))
})
app.get('/login-failed',(req,res)=>{
    res.sendFile('pages/failed.html',{root:__dirname});
    app.use(express.static('pages'))    
})
/*app.use('/',(req,res)=>{
    res.sendFile('pages/404.html',{root:__dirname})
    app.use(express.static('pages'))    
})*/
server.listen(5000);