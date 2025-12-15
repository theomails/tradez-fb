const logger = require("firebase-functions/logger");
const { getFirestore } = require('firebase-admin/firestore');
const  data = require('./data');
const money = require('./money');

const db = getFirestore();

function movePlayerIdToTileId(playerId, tileId, roomObjForMerge, gameState, notifications){
    gameState.playerToTileMap[playerId] = tileId;

    roomObjForMerge.gameState = roomObjForMerge.gameState || {};
    roomObjForMerge.gameState.playerToTileMap = gameState.playerToTileMap;

    var player = gameState.players.find(thisPlayer => { return thisPlayer.id == playerId });
    var tile = data.getAllTiles().find(thisTile => { return thisTile.id == tileId });
    const message = `Player ${player.name} moved to tile ${tile.name}.`;

    roomObjForMerge.notifications = roomObjForMerge.notifications || notifications;
    roomObjForMerge.notifications.push(message);
    return roomObjForMerge;
}
function onPlayerClicked({player}, gameState, notifications, userObj){
  const foundPlayer = gameState.players.find(p => p.id == player.id); 
  gameState.selectedPlayer = foundPlayer

  const roomObjForMerge = { gameState: {} };
  roomObjForMerge.gameState.selectedPlayer = gameState.selectedPlayer;
  return roomObjForMerge;
}
function onPlayerRollClicked(eventData, gameState, notifications, userObj){
  gameState.currentRolledDice = (Math.floor(Math.random() * 6) + 1);
  
  const roomObjForMerge = { gameState: {} };
  roomObjForMerge.gameState.currentRolledDice = gameState.currentRolledDice;
  
  const message = `Player ${gameState.selectedPlayer.name} rolled a ${gameState.currentRolledDice}.`;
  roomObjForMerge.notifications = notifications;
  roomObjForMerge.notifications.push(message);
  return roomObjForMerge;
}
function onPlayerMoveClicked(eventData, gameState, notifications, userObj){
    var rolledVal = gameState.currentRolledDice;
    var selPlayerId = gameState.selectedPlayer.id;
    var tileIdOfPlayer = gameState.playerToTileMap[gameState.selectedPlayer.id];

    //Current tile idx
    var tile = data.getAllTiles().find(thisTile => { return thisTile.id == tileIdOfPlayer });
    var tileIdx = data.getAllTiles().indexOf(tile);
    //Calc next tile idx
    var nextTileIdx = (tileIdx + rolledVal) % data.getAllTiles().length;

    gameState.currentRolledDice = null;
    gameState.selectedTile = data.getAllTiles()[nextTileIdx];

    let roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.currentRolledDice = gameState.currentRolledDice;
    roomObjForMerge.gameState.selectedTile = gameState.selectedTile;

    roomObjForMerge = movePlayerIdToTileId(selPlayerId, roomObjForMerge.gameState.selectedTile.id, 
      roomObjForMerge, gameState, notifications);
    return roomObjForMerge;
}
function onPickCardClicked(eventData, gameState, notifications, userObj){
    var availableChanceCards = gameState.availableChanceCards;
    var pickedIdx = Math.floor(Math.random() * (availableChanceCards.length - 0.01));
    var cards = availableChanceCards.splice(pickedIdx, 1);
    gameState.selectedChanceCard = cards[0];
    gameState.availableChanceCards = availableChanceCards;

    const roomObjForMerge = {};
    roomObjForMerge.gameState.selectedChanceCard = gameState.selectedChanceCard;
    roomObjForMerge.gameState.availableChanceCards = gameState.availableChanceCards;

    const message = `Player ${gameState.selectedPlayer.name} picked chance card: ${roomObjForMerge.gameState.selectedChanceCard}.`;
    roomObjForMerge.notifications = notifications;
    roomObjForMerge.notifications.push(message);
    return roomObjForMerge;
}
function onCloseCardClicked(eventData, gameState, notifications, userObj){
  gameState.selectedChanceCard = null;

  const roomObjForMerge = { gameState: {} };
  roomObjForMerge.gameState.selectedChanceCard = gameState.selectedChanceCard;
  return roomObjForMerge;
}
function onTileClicked({tileId}, gameState, notifications, userObj){
  var tile = data.getAllTiles().find(thisTile => { return thisTile.id == tileId });
  gameState.selectedTile = tile;

  const roomObjForMerge = { gameState: {} };
  roomObjForMerge.gameState.selectedTile = gameState.selectedTile;
  return roomObjForMerge;
}
function onJumpHereClicked(eventData, gameState, notifications, userObj){
    var tile = gameState.selectedTile;
    var player = gameState.selectedPlayer;
    const roomObjForMerge = { gameState: {} };
    movePlayerIdToTileId(player.id, tile.id, roomObjForMerge, gameState, notifications);
    return roomObjForMerge;
}
function onTransferClicked(eventData, roomObjForMerge, gameState, notifications, userObj){
  logger.info('Inside onTransferClicked ', eventData);
  const {fromBagOption, toBagOption, fromOps, toOps, transferSummaryText} = eventData;
  runOpsAndSave(fromBagOption, toBagOption, fromOps, roomObjForMerge, gameState);
  runOpsAndSave(toBagOption, fromBagOption, toOps, roomObjForMerge, gameState);
  
  const message = `Transferred ${transferSummaryText}.`;
  roomObjForMerge.notifications = roomObjForMerge.notifications || notifications;
  roomObjForMerge.notifications.push(message);
  return roomObjForMerge;
}
//Returns void
function runOpsAndSave(fromBagWrapper, toBagWrapper, ops, roomObjForMerge, gameState){
    logger.info('Inside runOpsAndSave ', {fromBagWrapper, toBagWrapper, ops});
    Object.keys(ops).forEach(denom => {
        var val = ops[denom] || 0;
        var avl = fromBagWrapper.bag[denom] || 0;
        var now = toBagWrapper.bag[denom] || 0;
        var rest = avl - val;
        var newNow = now + val;
        fromBagWrapper.bag[denom] = rest;
        toBagWrapper.bag[denom] = newNow;
        updateBag(fromBagWrapper, roomObjForMerge, gameState);
        updateBag(toBagWrapper, roomObjForMerge, gameState);
    });
}
//Returns void
function updateBag(bagWrapper, roomObjForMerge, gameState){
  if(bagWrapper.type=='bank'){
    logger.info('Update bank');
    gameState.bankMoneyBag = structuredClone(bagWrapper.bag);

    roomObjForMerge.gameState = roomObjForMerge.gameState || gameState;
    roomObjForMerge.gameState.bankMoneyBag = gameState.bankMoneyBag;
  }else if(bagWrapper.type=='uncle'){
    logger.info('Update uncle');
    gameState.uncleMoneyBag = structuredClone(bagWrapper.bag);

    roomObjForMerge.gameState = roomObjForMerge.gameState || gameState;
    roomObjForMerge.gameState.uncleMoneyBag = gameState.uncleMoneyBag;
  }else{
    logger.info('Update player');
    var player = gameState.players.find(thisPlayer => { return thisPlayer.id == bagWrapper.playerId });
    player.moneyBag = structuredClone(bagWrapper.bag);

    roomObjForMerge.gameState = roomObjForMerge.gameState || gameState;
    roomObjForMerge.gameState.players = gameState.players;
  }
}
function onBuyTileClicked(eventData, gameState, notifications, userObj){
    gameState.tileToOwnerMap[gameState.selectedTile.id] = gameState.selectedPlayer.id;
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.tileToOwnerMap = structuredClone(gameState.tileToOwnerMap);
    var player = gameState.selectedPlayer;
    var tile = gameState.selectedTile;
    
    const message = `Player ${player.name} bought tile ${tile.name}!`;
    roomObjForMerge.notifications = notifications;
    roomObjForMerge.notifications.push(message);
    return roomObjForMerge;
}
function onAddBoothClicked(eventData, gameState, notifications, userObj){
    var booths = gameState.tileToBoothMap[gameState.selectedTile.id] || 0;
    if(booths >= 2) {
      const message = `Tile ${tile.name} already has 2 tiles!`;
      const roomObjForMerge = {};
      roomObjForMerge.notifications = notifications;
      roomObjForMerge.notifications.push(message);
      return roomObjForMerge;
    } else {
      gameState.tileToBoothMap[gameState.selectedTile.id] = booths + 1;
      const roomObjForMerge = {};
      roomObjForMerge.gameState = {};
      roomObjForMerge.gameState.tileToBoothMap = gameState.tileToBoothMap;
      var player = gameState.selectedPlayer;
      var tile = gameState.selectedTile;
      const message = `Player ${player.name} added booth on tile ${tile.name}!`;
      roomObjForMerge.notifications = notifications;
      roomObjForMerge.notifications.push(message);
      return roomObjForMerge;
    }
}
function onStartGameClicked(eventData, gameState, notifications, userObj){
    if(gameState.players.length < 2){
        gameState.status = 'ADD_PLAYER';
    }else{
        gameState.status = 'ACTIVE';
    }
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.status = gameState.status;
    return roomObjForMerge;
}
function onShowTallyClicked(eventData, gameState, notifications, userObj){
    gameState.status = 'SHOW_TALLY';
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.status = gameState.status;
    return roomObjForMerge;
}
function onTallyClosed(){
    if(gameState.players.length < 2){
        gameState.status = 'ADD_PLAYER';
    }else{
        gameState.status = 'ACTIVE';
    }
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.status = gameState.status;
    return roomObjForMerge;
}
function onPlayerAdded({playerColor}, gameState, notifications, userObj){
    var player = {
        id: userObj.userId,
        name: userObj.userName,
        color: playerColor,
        moneyBag:  money.getDefaultPlayerMoneyBag()
    };

    gameState.players.push(player);    
    gameState.playerToTileMap[player.id] = data.getAllTiles()[0].id;

    if(gameState.players.length==1){
        gameState.selectedPlayer = gameState.players[0];
    }
    if(gameState.players.length < 2){
        gameState.status = 'ADD_PLAYER';
    }else{
        gameState.status = 'ACTIVE';
    }
    const message = `Player ${player.name} added.`;
    const roomObjForMerge = { gameState: {}, notifications };
    roomObjForMerge.gameState.players = gameState.players;
    roomObjForMerge.gameState.playerToTileMap = gameState.playerToTileMap;
    roomObjForMerge.gameState.selectedPlayer = gameState.selectedPlayer;
    roomObjForMerge.gameState.status = gameState.status;
    roomObjForMerge.notifications.push(message);
    return roomObjForMerge;
}

function postOnlyNotificationMessage(message, notifications){
  const roomObjForMerge = { notifications };
  roomObjForMerge.notifications.push(message);
  return roomObjForMerge;
}

function handleEventInner(eventName, eventData, gameState, notifications, userObj){
  let roomObjForMerge = null;
  if(eventName == 'playerClicked')
    roomObjForMerge = onPlayerClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'playerRollClicked')
    roomObjForMerge = onPlayerRollClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'playerMoveClicked')
    roomObjForMerge = onPlayerMoveClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'pickCardClicked')
    roomObjForMerge = onPickCardClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'cardCloseClicked')
    roomObjForMerge = onCloseCardClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'tileClicked')
    roomObjForMerge = onTileClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'jumpHereClicked')
    roomObjForMerge = onJumpHereClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'transferClicked')
    roomObjForMerge = onTransferClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'buyTileClicked')
    roomObjForMerge = onBuyTileClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'addBoothClicked')
    roomObjForMerge = onAddBoothClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'startGameClicked')
    roomObjForMerge = onStartGameClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'showTallyClicked')
    roomObjForMerge = onShowTallyClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'tallyClosed')
    roomObjForMerge = onTallyClosed(eventData, gameState, notifications, userObj);
  else if(eventName == 'playerAdded')
    roomObjForMerge = onPlayerAdded(eventData, gameState, notifications, userObj); //Move them out of Game events

  return roomObjForMerge;
}

exports.handleEvent = async function(eventName, eventData, roomObj, userObj){
    logger.info('Checking event..', {eventName, userId: userObj.userId});
    let allowed = false;
    const gameState = roomObj.gameState;
    const notifications = roomObj.notifications;

    let roomObjForMerge = null;
    if(eventName=='playerAdded') {
        let foundPlayer = gameState.players.find(player => player.id==userObj.userId);
        logger.info('foundPlayer ', foundPlayer);
        if(!foundPlayer){
            allowed = true;
        } else {
          roomObjForMerge = postOnlyNotificationMessage(`Player ${foundPlayer.name} is already in the game.`, notifications);
        }
    } else if(eventName=='startGameClicked') {
        if(gameState.owner.userId == userObj.userId){
            allowed = true;
        } else {
          roomObjForMerge = postOnlyNotificationMessage(`Only ${gameState.owner.userName} can start the game.`, notifications);
        }
    } else if(eventName=='playerClicked') {
        if(eventData.player.id == userObj.userId){
            allowed = true;
        } else {
          roomObjForMerge = postOnlyNotificationMessage(`${eventData.player.name} should click for their turn.`, notifications);
        }
    } else if(gameState.selectedPlayer && gameState.selectedPlayer.id == userObj.userId){
            allowed = true;
    } else {
      roomObjForMerge = postOnlyNotificationMessage(`${gameState.selectedPlayer.name} can only do this action.`, notifications);
    }

    if(allowed){
      logger.info('Allowed..');
      roomObjForMerge = handleEventInner(eventName, eventData, gameState, notifications, userObj);
    }
    if(roomObjForMerge){
      logger.info('Saving..');
      await db.doc(`rooms/${roomObj.roomId}`).set(roomObjForMerge, { merge: true });
    }
}
