'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const PAGE_ACCESS_TOKEN = "EAAVeRNjWvdgBAPZA71ZAOfk97c5ZBNmPjAZB2kZByTVFyBGztkAPnmDqZCZAQagAdYpCBbuNe6fyaHlzvgfWFfrTbwv4cHGgBcUHBHVWMi9eZC12gYukb8PAk2edfvs2EfZAZCyFA1P3ZAAuEvpV9FRfmkicDPXdczZA0r4ZCLHkfNxUY3wZDZD"

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', (req, res) => {
  res.send('1190484882')
})

// Facebook verification
app.get('/webhook', (req, res) =>{
  console.log('get');
  if(req.query['hub.verify_token'] === 'aPasswordThatWillBeSet'){
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

app.post('/webhook', (req, res) => {
  console.log('post')
  var data = req.body

  // Make sure this is a page subscription
  if(data.object === 'page'){

      // Iterate over each entry
      data.entry.forEach((entry) => {
        let pageID = entry.id;
        let timeOfEvent = entry.time

        // Iterate over each messaging event
        entry.messaging.forEach((event) => {
          if(event.message){
            recievedMessage(event)
          } else {
            console.log("Webhook recieved unknown event: ", event)
          }
        })
      })

      res.sendStatus(200);
  }
})

function recievedMessage(event){
  const senderID = event.sender.id
  const recipientID = event.recipient.id
  const timeOfMessage = event.timeStamp
  const message = event.message

  console.log("Recieved message for user %d and page %d at %d with message:",
          senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))

  const messageId = message.mid
  const messageText = message.text
  const messageAttachments = message.attachments

  if (messageText) {
    // Check to see if it matches a keyword and send back the example. Otherwise, just echo text
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID)
        break;
      default:
        sendTextMessage(senderID, messageText)
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachments recieved")
  }
}

function sendGenericMessage(recipientID, messageText){

}

function sendTextMessage(recipientID, messageText) {
  const messageData = {
    recipient: {
      id: recipientID
    },
    message: {
      text: messageText
    }
  }

  callSendAPI(messageData)
}

function callSendAPI(messageData){
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: messageData
  }, (error, response, body) => {
    if(!error && response.statusCode == 200) {
      const recipientID = body.recipient_id
      const messageID = body.recipient_id

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageID, recipientID);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  })
}

app.listen(app.get('port'), () => {
  console.log('running on heroku port', app.get('port'))
})
