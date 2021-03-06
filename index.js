'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const PAGE_ACCESS_TOKEN = "<access_token>"

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', (req, res) => {
  res.send('Hello, I am a messenger bot')
})

// Facebook verification
app.get('/webhook', (req, res) =>{
  if(req.query['hub.verify_token'] === 'aPasswordThatWillBeSet'){
    res.status(200).send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
  res.sendStatus(403)
})

app.post('/webhook', (req, res) => {
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
  const messageData = {
    recipient: {
      id: recipientID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  }

  callSendAPI(messageData)
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
