var express = require('express');
var router = express.Router();
var axios = require('axios');
var fieldCount = 0;
var akinox_api_key = '';
const { Pool, Client } = require('pg');
const pool = new Pool({
  user: "doadmin",
  host: "db-postgresql-nyc3-54349-do-user-4811165-0.b.db.ondigitalocean.com",
  database: "defaultdb",
  password: "rLDjEJzgeZ8ZizjS",
  port: "25060",
  ssl: {
    rejectUnauthorized: false
  }
});

/* GET home page. */

async function makeDBRequest(queryStr){
  let client = await pool.connect();
  return new Promise((resolve, reject) => {
      console.log("CONNECT");
      client.query(queryStr)
      .then(responseData =>{
          resolve(responseData);
          client.release();
          console.log("DISCONNECT");
      })
      .catch(err =>{
          console.log(err);
          reject(err);
          client.release();
          console.log("DISCONNECT");
      });
  });  
}

router.get('/', function(req, res, next) {
    res.render('index');
});

router.post('/', (req, res, next) => {
  console.log()
    let guid = "6969";
    // res.send({"guid": guid});
    makeDBRequest(`SELECT * FROM akinox_credentials WHERE guid = '${guid}';`)
    .then((response) => {
      if (response.rowCount != 0) {
        res.send({"status":"registered"});
        akinox_api_key = response.rows[0].akinox_api_key;
        return;
      }
      if (response.rowCount == 0) {
        res.send({"status":"new"});
        return;
      }

    })
    .catch((e) => {console.log(e)});   
});

router.post('/validate', (req, res, next) => {
  console.log(req.body);
  var data = JSON.stringify({
    "input": req.body.qrInput,
    "inputs": []
  });

  var config = {
    method: 'post',
    url: 'https://api.akinox.cloud/v1.0',
    headers: { 
      'X-Akinox-API-Key': akinox_api_key, 
      'Content-Type': 'application/json'
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    let name = "N/A";
    let dob = "N/A";
    if (response.data.name != "" && response.data.dob != ""){
      name = response.data.name;
      dob = response.data.dob;
    }
    if (response.data.pass == true){
        res.render('success', {name: name, dob: dob});
        
    }
    else if (response.data.pass == false){
      res.render('failure', {name: name, dob: dob});
        
    }
  })
  .catch(function (error) {
    console.log(error);
  });
});

router.get('/success', (req, res, next) => {
  res.render('success');
})

router.get('/failure', (req, res, next) => {
  res.render('failure');
})

router.get('/individual', (req, res, next) => {
  fieldCount = 1;
  res.render('individual', {count: fieldCount});
})

router.post('/addField',(req, res, next) => {
  fieldCount++;
  res.render('individual', {count: fieldCount});
})

router.post('/individualCheck', (req, res, next) => {
  console.log(req.body);
  if (fieldCount == 1) {
    var data = JSON.stringify({
      "input": req.body.qrcode,
      "inputs": []
    });
  
    var config = {
      method: 'post',
      url: 'https://api.akinox.cloud/v1.0',
      headers: { 
        'X-Akinox-API-Key': '364c8dc6-09c7-4b64-bc8b-316091f053bc', 
        'Content-Type': 'application/json'
      },
      data : data
    };
  
    axios(config)
    .then(function (response) {
      let name = "N/A";
      let dob = "N/A";
      if (response.data.name != "" && response.data.dob != ""){
        name = response.data.name;
        dob = response.data.dob;
      }
      if (response.data.pass == true){
          res.render('success', {name: name, dob: dob});
          
      }
      else if (response.data.pass == false){
        res.render('failure', {name: name, dob: dob});
          
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }
})
router.post('/mainMenu', (req, res, next) => {
  res.redirect('/individual');
})

router.get('/menu', (req, res, next) => {
  res.render('menu');
})
module.exports = router;
