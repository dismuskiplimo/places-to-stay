const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const config = require('./db-config.js');
const valid = require("card-validator");

/* 
    API ROUTES 
*/

// route to return all the accomodation in the database
router.get('/accomodation/all', (req, res) => {
    // create the mysql connection
    const db = mysql.createConnection(config);

    // attempt to connect to the database
    db.connect((err) => {
        if (err) throw err;
    
        // connection established
        console.log("Connected to DB");
    });
  
    // SQL that is going to be executed
    const sql = `SELECT * FROM accommodation`;

    let query = db.query(sql, (err, result, fields) => {
        // if there is an error with the sql, throw it
        if(err) throw err;
        
        // close the database connection
        db.end();

        // return the result
        res.json(result);
  });
});

// route to return all the accomodation in a specified location
router.get('/accomodation/:location', (req, res) => {
    // create the mysql connection
    const db = mysql.createConnection(config);

    // attempt to connect to the database
    db.connect((err) => {
        if (err) throw err;
    
        // connection established
        console.log("Connected to DB");
    });
  
    // location received from URI parameters
    const location = req.params.location;

    // SQL that is going to be executed
    const sql = `SELECT * FROM accommodation WHERE location = '${location}'`;

    let query = db.query(sql, (err, result, fields) => {
        // if there is an error with the sql, throw it
        if(err) throw err;
        
        // close the database connection
        db.end();

        // return the result
        res.json(result);
  });
});

// route to return a specified type of accomodation in a specified location 
router.get('/accomodation/:type/:location', (req, res) => {
    // create the mysql connection
    const db = mysql.createConnection(config);

    // attempt to connect to the database
    db.connect((err) => {
        if (err) throw err;
    
        // connection established
        console.log("Connected to DB");
    });
  
    // location received from URI parameters
    const location = req.params.location;
    // type received from URI parameters
    const type = req.params.type;

    // SQL that is going to be executed
    const sql = `SELECT * FROM accommodation WHERE location = '${location}' AND type = '${type}'`;

    let query = db.query(sql, (err, result, fields) => {
        // if there is an error with the sql, throw it
        if(err) throw err;
        
        // end the database connection
        db.end();

        // return the result
        res.json(result);
  });
});

// route to create a booking
router.post('/booking/create', (req, res) => {
    let acc_id = req.body.acc_id;
    let date = req.body.date;
    let no_of_people = req.body.no_of_people;
    let card_no = req.body.card_no;

    //check if user is logged in
    if(!req.session.userId || !req.session.username){
        res.status(403);
        return res.json({"msg": "Error: You need to login before booking"});
    }
    
    // check if required fields have been filled
    if(acc_id == null || acc_id == "" ||
       date == null || date == "" || date.length != 6 ||
       no_of_people == null || no_of_people == "" || no_of_people < 1
    ){
        res.status(400);
        return res.json({msg: "Error! Please ensure that all the required fields have been properly filled (acc_id, date, no of people)"});
    }

    //check if the provided date is past
    let day = new Date('20' + date.substring(0,2), (date.substring(2,4) - 1), date.substring(4));
    let now = new Date();

    if(now > day){
        res.status(400);
        return res.json({msg: "Error! The date provided is in the past"});
    }

    //check of the card no provided is valid
    let numberValidation = valid.number(card_no);

    if (!numberValidation.isValid) {
        res.status(400);
        return res.json({msg: "Error! The credit card number provided is invalid"});
    }
    
    // create the mysql connection
    const db = mysql.createConnection(config);

    // attempt to connect to the database
    db.connect((err) => {
        if (err) throw err;
    
        // connection established
        console.log("Connected to DB");
    });
  
    // SQL that is going to be executed
    let sql = `SELECT * FROM accommodation WHERE ID = ${acc_id}`;

    db.query(sql, (err, result, fields) => {
        // if there is an error with the sql, throw it
        if(err) throw err;

        // check if the selected accomodation exists
        if(result.length > 0){
            // accomodation id exists
            // check if the accomodation will fit all the guests
            sql = `SELECT * FROM acc_dates WHERE thedate = ${date}`;

            db.query(sql, (err, result, fields) => {
                if (err) throw err;
                
                // accomodation is available on that particular day 
                if(result.length > 0){
                    // accomodation is available on that particular day
                    // the number of guests will fit the availability
                    if(no_of_people <= result[0].availability){
                        // add an entry to bookings
                        sql = `INSERT INTO acc_bookings(accID, thedate, username, npeople) VALUES(${acc_id}, ${date}, '${req.session.username}', ${no_of_people})`;
                        db.query(sql, (err) => {
                            if (err) throw err;

                            // reduce the availability in acc_dates 
                            sql = `UPDATE acc_dates SET availability = ${result[0].availability - no_of_people} WHERE accID = ${acc_id} AND thedate = ${date}`;
                            db.query(sql, (err) => {
                                if (err) throw err;
                            
                            });
                        });

                        // reduce the availability
                        
                        res.status(200);
                        return res.json({msg: `Success! Accomodation booked on ${date} for ${no_of_people} guest(s)`});
                    }
                    
                    // the number of guests exceeds the availability
                    else{
                        res.status(400);
                        return res.json({msg: `Error! The provided number of guests (${no_of_people}) exceeds the current availability for this date. Current availability is ${result[0].availability}`});
                    }
                }

                // accomodation is not available on that particular day
                else{
                    res.status(400);
                    return res.json({msg: `Error! No availability on the selected date`});
                }
            });
        }

        // the accomodation id provided does not exist
        else{
            res.status(404);
            return res.json({msg: "Error! Accomodation ID does not exist"});
        }      
    });
});

// route to login a user
router.post('/login', (req, res) => {
    // create the mysql connection
    const db = mysql.createConnection(config);

    // attempt to connect to the database
    db.connect((err) => {
        if (err) throw err;
    
        // connection established
        console.log("Connected to DB");
    });
  
    // username received from request body
    const username = req.body.username;
    // password received from request body
    const password = req.body.password;

    // SQL that is going to be executed
    const sql = `SELECT * FROM acc_users WHERE username = '${username}' AND password = '${password}'`;

    let query = db.query(sql, (err, result, fields) => {
        // if there is an error with the sql, throw it
        if(err) throw err;
        
        // check if a user was found with the credentials provided
        // if user was found, set the session
        if(result.length > 0){
            // set the session
            req.session.userId = result[0].ID;
            req.session.username = result[0].username;

            return res.json({"msg": "Success! Logged in"});
        }
        // user was not found, set an error status code
        else{
            // set the status code
            res.status(403);
            return res.json({"msg": "Error: Invalid Login Details"});
        }
  });
});

// route to check if user is logged in
router.post('/login/check', (req, res) => {
    if(req.session.userId && req.session.username){
        return res.json({msg: `Logged in as ${req.session.username}`});
    }

    res.status(403);
    return res.json({msg: "Not logged in"});
});

module.exports = router