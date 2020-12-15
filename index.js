const BootBot = require('bootbot');
const config = require('config');
// const fetch = require('node-fetch');

const zomato = require('zomato-api');
const client = zomato({
userKey: '1a6f9d8c47740e61cf552bd2a9b51212'
});

var port = process.env.PORT || config.get('PORT');


const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

bot.on('message', (payload, chat) => {
	const text = payload.message.text;
  console.log(`The user said: ${text}`);
  const userId = payload.sender.id;
  chat.say(userId, 'Hi human friend! I can help you search restaurants. Are you hungry?', {typing: true});
});

bot.hear(['Yes'], (payload, chat) => {
  console.log('The user said "I am hungry"!');
  chat.say('Please provide me with location to find restaurants for you. Tell me "city" and the name of your city', 
  {typing: true});
});

bot.hear(/city (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const cityName = data.match[1];
    console.log("Somebody asked about restaurants in "+ cityName);
    client.getLocations({query: cityName})
      .then(res => res.json())
      .then(json => {
        console.log("Search result is "+JSON.stringify(json));
        if (json.Response === "False") {
          conversation.say(
            'I could not find the city '+cityName+', you can try searching for city like "city [city name]"', 
          {typing: true});
          conversation.end();
        } else {
          const cityID = json.entity_id;
          const placeType = json.entity_type;
          // Prague: "id": 84,
          client.getCollections({city_id: cityID})
            .then(res => res.json())
            .then(list => {
              conversation.say('Here are few top rated restaurants that I have found:' +list.url, {typing: true});
            });
          setTimeout(() => {
            conversation.say(
              "Could I help you also with type of cuisine? To make your choise more easy?", 
              {typing: true});
          }, 1000);
          handlePlot(conversation, json);
        }
    });
  });
});

function handlePlot(conversation, json) {
  setTimeout(() => {
    conversation.ask({
      text: "Which cuisine do you wish to eat today?",
      quickReplies: ["Asian", "Italian", "Mexican", "Indian"],
      options: {typing: true}
    }, (payload, conversation) => {
      if (payload.message.text === "Italian") {
        // "cuisine_id": 55
        console.log("Italian");
        client.search({
          entity_id: json.entity_id,
          entity_type: json.entity_type,
          cuisines: 55
        }).then(res => res.json())
        .then(list => {
          conversation.say(
            'Here are one of the best restaurants with ' + payload.message.text + ' cuisine that I have found:', 
          {typing: true});
          setTimeout(() => {
            conversation.say(list[0].restaurant.name + list[0].restaurant.url, {typing: true});
          }, 1000);
        });
      } else if (payload.message.text === "Asian") {
        // "cuisine_id": 3
        console.log("Asian");
        client.search({
          entity_id: json.entity_id,
          entity_type: json.entity_type,
          cuisines: 3
        }).then(res => res.json())
        .then(list => {
          conversation.say(
            'Here are one of the best restaurants with ' + payload.message.text + ' cuisine that I have found:', 
          {typing: true});
          setTimeout(() => {
            conversation.say(list[0].restaurant.name + list[0].restaurant.url, {typing: true});
          }, 1000);
        });
      } else if (payload.message.text === "Mexican") {
        // "cuisine_id": 73
        console.log("Mexican");
        client.search({
          entity_id: json.entity_id,
          entity_type: json.entity_type,
          cuisines: 73
        }).then(res => res.json())
        .then(list => {
          conversation.say(
            'Here are one of the best restaurants with ' + payload.message.text + ' cuisine that I have found:', 
          {typing: true});
          setTimeout(() => {
            conversation.say(list[0].restaurant.name + list[0].restaurant.url, {typing: true});
          }, 1000);
        });
      } else if (payload.message.text === "Indian") {
        // "cuisine_id": 148
        console.log("Indian");
        client.search({
          entity_id: json.entity_id,
          entity_type: json.entity_type,
          cuisines: 148
        }).then(res => res.json())
        .then(list => {
          conversation.say(
            'Here are one of the best restaurants with ' + payload.message.text + ' cuisine that I have found:', 
          {typing: true});
          setTimeout(() => {
            conversation.say(list[0].restaurant.name + list[0].restaurant.url, {typing: true});
          }, 1000);
        });
      }
      conversation.end();
    });
  }, 2000);
}
bot.hear(['No'], (payload, chat) => {
  console.log('The user said "I am not hungry"!');
  chat.say('Good for you! But maybe I could help you another time', {typing: true});
});
bot.hear([/thank (you)/i,], (payload, chat) => {
	chat.say('You are welcome, always at your service');
});
bot.hear([/(good)?bye/i, /see (ya|you)/i, 'adios'], (payload, chat) => {
	chat.say('Bye, human!');
});

bot.start(port);