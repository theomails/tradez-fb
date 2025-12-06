// index.js (top)
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// initialize admin first
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) initializeApp();            // safe guard in dev/emulator
const db = getFirestore();                          // now safe to call

const { AppHttpError, buildResponseForAppHttpError } = require('./error');
const data = require('./data');
const money = require('./money');

// require gameservice AFTER init/db
const gameservice = require('./gameservice');

/*
 * CORS
 */
const allowedOrigins = [
  "https://tradez.nanoapps.net",
  "https://tradez-nano-apps.web.app",
  "http://localhost:8080"
];
function setCorsHeaders(req, res){
  // Set CORS headers (Allows all origins)
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");  
}

/*
 * COMMON Operations
 */
async function addNotificationToRoomInner(roomObj, message){
  roomObj.notifications.push(message);
  const roomObjForMerge = { notifications: roomObj.notifications };
  await db.doc(`rooms/${roomId}`).set(roomObjForMerge, { merge: true });
}


function getNewRandomPart(){
  return parseInt(Math.random() * 10000, 10);
}

async function loadUser(userId){
  if (!userId) {
    throw new AppHttpError(400, 'Missing userId');
  }
  const userSnap = await db.doc(`users/${userId}`).get();
  if (!userSnap.exists) {
    throw new AppHttpError(404, 'User not found');
  }  
  const userObj = userSnap.data();
  return userObj;
}

async function loadRoom(roomId){
  if (!roomId) {
    throw new AppHttpError(400, 'Missing roomId');
  }
  const roomSnap = await db.doc(`rooms/${roomId}`).get();
  if (!roomSnap.exists) {
    throw new AppHttpError(404, 'Room not found');
  }  
  const roomObj = roomSnap.data(); 
  return roomObj;
}

/*
 * BUSINESS Operations 
 */
async function addUserToRoomInner(userId, roomId){

  const userObj = await loadUser(userId);
  const roomObj = await loadRoom(roomId);

  const existingSameUser = roomObj.users.find(user => user.userId == userObj.userId);
  if(existingSameUser){
    return { statusCode: 'ALREADY_EXISTS', statusMessage: 'User already exists in room' };
  } else {
    roomObj.users.push(userObj);
    const roomObjForMerge = { users: roomObj.users };
    await db.doc(`rooms/${roomId}`).set(roomObjForMerge, { merge: true });

    addNotificationToRoomInner(roomObj, `User ${userObj.userName} joined the room.`);

    return { statusCode: 'ADDED', statusMessage: 'User added to room' };
  }
}

exports.addUserToRoom = onRequest(async (req, res) => {
    try {
        setCorsHeaders(req, res);

        const { userId, roomId } = req.body;
        const result = await addUserToRoomInner(userId, roomId);
        
        return res.status(200).json({ message: result.statusMessage });
      } catch (error) {
        if(error instanceof AppHttpError){
          console.error("App error with addUserToRoom operation:", error);
          return buildResponseForAppHttpError(error, res);
        } else {
          console.error("Unknown error with addUserToRoom operation:", error);
          return res.status(error.response?.status || 500).json({ error: error.message });
        }
      }
});

async function createRoomByOwnerInner (userId){
        let roomId = getNewRandomPart() + "-" + Date.now();
        let userObj = await loadUser(userId);
        let roomName = `${userObj.userName}'s Room`;

        let roomObj = { roomId, 
            roomName, 
            owner: userObj, 
            users:[userObj],
            gameState: {
                status: 'NOT_READY',
                availableChanceCards: data.getChanceOptions(),
                selectedChanceCard: null,
                players: [
                ],
                selectedPlayer: {},
                currentRolledDice: null,
                selectedTile: data.getAllTiles()[0],
                playerToTileMap: {},
                tileToOwnerMap: {},
                tileToBoothMap: {},
                bankMoneyBag: money.getDefaultBankMoneyBag(),
                uncleMoneyBag: {}
            },
            notifications: [
                `${roomName} is ready!`
            ]
        };
        
        //Store and wait
        await db.doc(`rooms/${roomId}`).set(roomObj);
        return roomObj;
};

exports.createRoomByOwner = onRequest(async (req, res)=>{
    try {
        setCorsHeaders(req, res);

        const { userId } = req.body;
        const roomObj = await createRoomByOwnerInner(userId);

        return res.status(200).json(roomObj);
      } catch (error) {
        if(error instanceof AppHttpError){
          console.error("App error with createRoomByOwner operation:", error);
          return buildResponseForAppHttpError(error, res);
        } else {
          console.error("Unknown error with createRoomByOwner operation:", error);
          return res.status(error.response?.status || 500).json({ error: error.message });
        }
      }
});


exports.processGameCommand = onRequest(async (req, res)=>{
    try {
        setCorsHeaders(req, res);

        const { userId, roomId, eventName, eventData } = req.body;
        const userObj = await loadUser(userId);
        const roomObj = await loadRoom(roomId);
        
        await gameservice.handleEvent(eventName, eventData, roomObj, userObj);

        return res.status(200).json({ message: 'Event processed.' });
      } catch (error) {
        if(error instanceof AppHttpError){
          console.error("App error with createRoomByOwner operation:", error);
          return buildResponseForAppHttpError(error, res);
        } else {
          console.error("Unknown error with createRoomByOwner operation:", error);
          return res.status(error.response?.status || 500).json({ error: error.message });
        }
      }
});
