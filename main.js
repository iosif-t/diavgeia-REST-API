const express = require('express');
var cors=require('cors');
//var http = require('http');
//var httpServer = http.createServer(app);
//,'192.168.1.8'

const app = express();
app.listen(5500,()=>console.log('listening at 5500'));
//app.use(express.static('public'));
app.use(express.json({limit:'1mb'}));
app.use(cors());

var jsons='';

app.get('/api',(req,response)=>{
  
  const request =require("request");
  var Url=getUrl(req.originalUrl);
 
  request({
    url:Url,json:true},
    (err, res, body) => {
      
      jsons = (JSON.stringify(body, undefined, 4)).slice();
      var obj = JSON.parse(jsons);
      
      response.json({
        status: "success",
        objects: obj,
      });
  
    });  
}); 

function getUrl(str) {
  return str.split('URL=')[1];
}
