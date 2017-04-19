'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', (req, res) => {
  res.send('Hello world, I am a chat bot')
})

// Facebook verification
app.get('/webhook/', (req, res) =>{
  if(req.query['hub.verify_token'] === 'aPasswordThatWillBeSet'){
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'))
})
