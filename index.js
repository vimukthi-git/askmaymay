const request = require('request');
const BOT_API_KEY = "194221228:AAE1BvZb_CwgYPxZuwX4755nOj_f9IiQVgI";
const DDG = require('node-ddg-api').DDG;
const ddg = new DDG('askmaymay');

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

var last_updates = [''];
process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`);
});

setInterval(function() {
    //console.log(last_update);
    request("https://api.telegram.org/bot" + BOT_API_KEY + "/getUpdates?offset=" + last_updates[last_updates.length - 1],
    function (error, response, body) {
        var body = JSON.parse(body);
        if (!error && response.statusCode == 200) {
            if(body.ok) {
                for(var i = 0; i < body.result.length; i++) {
                    var msgObj = body.result[i];
                    if(last_updates.includes(msgObj.update_id)) continue;
                    last_updates.push(msgObj.update_id);
                    var msg = msgObj.message;
                    var from = msg.from;
                    var chat = msg.chat;
                    var query = msg.text;
                    console.log(query);
                    ddg.instantAnswer(query, {skip_disambig: '0'}, function(err, response) {
                        //console.log(response);
                        if (response && response.RelatedTopics.length) {
                            request("https://api.telegram.org/bot" + BOT_API_KEY + "/sendMessage?"+
                            "chat_id=" + chat.id +
                            "&text=" + response.RelatedTopics[0].Text +
                            "&reply_to_message_id=" + msg.message_id,
                            function (error, response, body) {
                                console.log(error);
                            });
                        }
                    });
                }
            }
        } else {
            console.log(err);
        }
    });
}, 100);




