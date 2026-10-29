// Demo meetups: no backend, people and chats are simulated.
export const PEOPLE = {
  mia:{name:'Mia K.', av:'🦊'}, jonas:{name:'Jonas W.', av:'🐻'}, ana:{name:'Ana P.', av:'🐼'}, tom:{name:'Tom R.', av:'🐸'},
  lea:{name:'Lea S.', av:'🦋'}, kenji:{name:'Kenji T.', av:'🐯'}, priya:{name:'Priya N.', av:'🦉'}, carlos:{name:'Carlos D.', av:'🐙'},
  emma:{name:'Emma L.', av:'🐧'}, noah:{name:'Noah F.', av:'🦁'},
};
// Start times are relative to today so the demo meetups are always upcoming.
const at = (days, h, m=0) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(h, m, 0, 0); return d.getTime(); };
const later = t => t > Date.now() ? t : Math.ceil((Date.now() + 36e5) / 18e5) * 18e5;   // already past: 1 h from now, on the half hour
// people[0] is the host; chat seeds are [person, text, minutes before the chat is first opened]
export const MEETUPS = [
  {id:'m1', title:'Sunset picnic on the runways', placeId:'tempelhof', start:later(at(0,18)), max:10, people:['mia','kenji','lea','carlos'],
   desc:'Bring a blanket and something to share. We meet at the Columbiadamm entrance and walk out onto the old runway for sunset. Kites welcome!',
   chat:[['mia','Hi all! I\'ll bring a big blanket and some Club-Mate 🧉',1500],['kenji','Nice! I can bring snacks. Which entrance exactly?',1497],
         ['mia','Columbiadamm, next to the old tower. Look for the orange kite 🪁',1494],['lea','Perfect, see you there!',95]]},
  {id:'m2', title:'Street-art walk along the Wall', placeId:'eastside', start:at(1,10), max:8, people:['jonas','ana','priya'],
   desc:'A slow walk along the 1.3 km of murals, with stops at the famous ones. Coffee afterwards at the Spree. Good shoes recommended.',
   chat:[['jonas','Morning walk tomorrow! We start at Ostbahnhof side ☀️',190],['ana','Can\'t wait to see the Fraternal Kiss in person',186],
         ['priya','I\'ll be 5 min late, start without me 🙈',40]]},
  {id:'m3', title:'Morning at the Neues Museum', placeId:'museuminsel', start:at(2,11), max:6, people:['ana','emma'],
   desc:'Let\'s see Nefertiti together, then grab lunch nearby. Book your own time-slot ticket online, we meet at the entrance.',
   chat:[['ana','Hi! I booked the 11:00 slot 🎟️',1300],['emma','Same! Is there a student discount?',1296],['ana','Yes, bring your student card',1295]]},
  {id:'m4', title:'Picnic & karaoke afternoon', placeId:'mauerpark', start:at(3,15), max:20, people:['carlos','tom','noah','lea','jonas','mia'],
   desc:'Picnic on the hill in Mauerpark and singing in the stone amphitheatre if the weather is good. Shy singers welcome too 🎤',
   chat:[['carlos','Who\'s brave enough to sing? 🎤',2000],['tom','Only if someone does a duet with me',1997],['noah','I\'m in for ABBA 🙌',1990],
         ['lea','I\'ll bring a speaker in case it\'s quiet',300],['carlos','Legend!',299]]},
  {id:'m5', title:'Sundowner at the TV Tower', placeId:'tvtower', start:at(4,19), max:4, people:['priya','emma','noah','kenji'],
   desc:'Watch the sun go down from 200 m up. Small group, the time slot is already booked for four people.',
   chat:[['priya','Tickets are booked for all 4 of us ✅',3000],['kenji','Thanks Priya! I\'ll pay you back',2996],['emma','Meet at the bottom 15 min before?',2990],['noah','👍',2989]]},
  {id:'m6', title:'Coffee & courtyard crawl', placeId:'hackesche', start:at(9,10,30), max:8, people:['emma','tom'],
   desc:'Explore all eight courtyards of the Hackesche Höfe, little shops and galleries included, with coffee breaks in between.',
   chat:[['emma','Planning a cosy coffee morning ☕',130],['tom','Do you know a good bakery there?',126],['emma','Yes, I\'ll show you my favourite one 🥐',125]]},
];
MEETUPS.forEach(m => m.host = m.people[0]);
export const REPLIES = ['Sounds great! 🙌','Haha yes 😄','See you there!','Count me in 👍','Good idea!','Can\'t wait 🤩','Welcome! Glad you\'re joining 👋',
                 'Perfect, thanks for letting us know','Same here 😊','Love it 💚','I\'ll be there a bit early','Nice, the more the merrier!'];
