const logger = require("firebase-functions/logger");
const { getFirestore } = require('firebase-admin/firestore');
const  data = require('./data');
const money = require('./money');

const db = getFirestore();

function prepareMovePlayerIdToTileId(playerId, tileId, roomObjForMerge, gameState, notifications){
    gameState.playerToTileMap[playerId] = tileId;

    roomObjForMerge.gameState = roomObjForMerge.gameState || {};
    roomObjForMerge.gameState.playerToTileMap = gameState.playerToTileMap;

    const player = gameState.players.find(thisPlayer => { return thisPlayer.id == playerId });
    const tile = data.getAllTiles().find(thisTile => { return thisTile.id == tileId });
    const message = `Player ${player.name} moved to tile ${tile.name}.`;

    roomObjForMerge.notifications = roomObjForMerge.notifications || notifications;
    roomObjForMerge.notifications.unshift(message);
    return roomObjForMerge;
}
function onPlayerClicked({player}, gameState, notifications, userObj){
  const newSelectedPlayer = gameState.players.find(p => p.id == player.id); 
  const oldSelectedPlayer = gameState.selectedPlayer;
  gameState.selectedPlayer = { //Not strictly necessary, as all players have uniform props. Anyway, just in case..
    ...nullExistingProps(oldSelectedPlayer),
    ...newSelectedPlayer
  };

  logger.info("onPlayerClicked: Proceeding with ", { inPlayerId: player.id, newSelectedPlayer: gameState.selectedPlayer });
  const roomObjForMerge = { gameState: {} };
  roomObjForMerge.gameState.selectedPlayer = gameState.selectedPlayer;
  return roomObjForMerge;
}
function onPlayerRollClicked(eventData, gameState, notifications, userObj){
  gameState.currentRolledDice = (Math.floor(Math.random() * 6) + 1);
  
  logger.info("onPlayerRollClicked: Proceeding with ", { currentRolledDice: gameState.currentRolledDice});
  const roomObjForMerge = { gameState: {} };
  roomObjForMerge.gameState.currentRolledDice = gameState.currentRolledDice;
  
  const message = `Player ${gameState.selectedPlayer.name} rolled a ${gameState.currentRolledDice}.`;
  roomObjForMerge.notifications = notifications;
  roomObjForMerge.notifications.unshift(message);
  return roomObjForMerge;
}
function onPlayerMoveClicked(eventData, gameState, notifications, userObj){
    const rolledVal = gameState.currentRolledDice;
    const selPlayerId = gameState.selectedPlayer.id;
    const tileIdOfPlayer = gameState.playerToTileMap[selPlayerId];

    //Current tile idx
    const foundTileIdx = data.getAllTiles().findIndex(thisTile => { return thisTile.id == tileIdOfPlayer });
    //Calc next tile idx
    const nextTileIdx = (foundTileIdx + rolledVal) % data.getAllTiles().length;

    const newSelectedTile = data.getAllTiles()[nextTileIdx];
    const oldSelectedTile = gameState.selectedTile;
    gameState.currentRolledDice = null;
    gameState.selectedTile = {
      ...nullExistingProps(oldSelectedTile),
      ...newSelectedTile
    };

    let roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.currentRolledDice = gameState.currentRolledDice;
    roomObjForMerge.gameState.selectedTile = gameState.selectedTile;

    logger.info("onPlayerMoveClicked: Proceeding with: ", {
      rolledVal, selPlayerId, tileIdOfPlayer, foundTileIdx, nextTileIdx, selectedTile: gameState.selectedTile
    });
    roomObjForMerge = prepareMovePlayerIdToTileId(selPlayerId, roomObjForMerge.gameState.selectedTile.id, 
      roomObjForMerge, gameState, notifications);
    return roomObjForMerge;
}
function onPickCardClicked(eventData, gameState, notifications, userObj){
    const availableChanceCards = gameState.availableChanceCards;
    const pickedIdx = Math.floor(Math.random() * (availableChanceCards.length - 0.01));
    const cards = availableChanceCards.splice(pickedIdx, 1);
    gameState.selectedChanceCard = cards[0];
    gameState.availableChanceCards = availableChanceCards;

    logger.info("onPickCardClicked: Proceeding with ", { 
      pickedIdx, selectedChanceCard: cards[0], availableChanceCardsLen: availableChanceCards.length 
    });
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.selectedChanceCard = gameState.selectedChanceCard;
    roomObjForMerge.gameState.availableChanceCards = gameState.availableChanceCards;

    const message = `Player ${gameState.selectedPlayer.name} picked chance card: ${roomObjForMerge.gameState.selectedChanceCard}.`;
    roomObjForMerge.notifications = notifications;
    roomObjForMerge.notifications.unshift(message);
    return roomObjForMerge;
}
function onCloseCardClicked(eventData, gameState, notifications, userObj){
  gameState.selectedChanceCard = null;

  logger.info("onCloseCardClicked: Proceeding ");
  const roomObjForMerge = { gameState: {} };
  roomObjForMerge.gameState.selectedChanceCard = gameState.selectedChanceCard;
  return roomObjForMerge;
}
function onTileClicked({tileId}, gameState, notifications, userObj){
  const newSelectedTile = data.getAllTiles().find(thisTile => { return thisTile.id == tileId });
  const oldSelectedTile = gameState.selectedTile;
  gameState.selectedTile = {
    ...nullExistingProps(oldSelectedTile),
    ...newSelectedTile
  };

  logger.info("onTileClicked: Proceeding with ", { inTileId: tileId, foundTile: newSelectedTile });
  const roomObjForMerge = { gameState: {} };
  roomObjForMerge.gameState.selectedTile = gameState.selectedTile;
  return roomObjForMerge;
}
function onJumpHereClicked(eventData, gameState, notifications, userObj){
    const tile = gameState.selectedTile;
    const player = gameState.selectedPlayer;

    logger.info("onJumpHereClicked: Proceeding with ", { player, toTile: tile });
    const roomObjForMerge = { gameState: {} };
    prepareMovePlayerIdToTileId(player.id, tile.id, roomObjForMerge, gameState, notifications);
    return roomObjForMerge;
}
function onTransferClicked(eventData, gameState, notifications, userObj){
  logger.info('Inside onTransferClicked ', eventData);
  const roomObjForMerge = { gameState: {} };
  const {fromBagOption, toBagOption, fromOps, toOps, transferSummaryText} = eventData;

  loadBagIntoWrapper(fromBagOption, gameState);
  loadBagIntoWrapper(toBagOption, gameState);
  runOpsAndSave('doFromOps', fromBagOption, toBagOption, fromOps, roomObjForMerge, gameState);
  runOpsAndSave('doToOps', toBagOption, fromBagOption, toOps, roomObjForMerge, gameState);
  
  const message = `Transferred ${transferSummaryText}.`;
  roomObjForMerge.notifications = roomObjForMerge.notifications || notifications;
  roomObjForMerge.notifications.unshift(message);

  logger.info('Out onTransferClicked ', roomObjForMerge);
  return roomObjForMerge;
}
//Returns void
function runOpsAndSave(reasonStr, fromBagWrapper, toBagWrapper, ops, roomObjForMerge, gameState){
    logger.info('Inside runOpsAndSave ', { reasonStr, fromBagWrapper, toBagWrapper, ops});
    Object.keys(ops).forEach(denom => {
        const val = ops[denom] || 0;
        if(val){
          const fromAvl = fromBagWrapper.bag[denom] || 0;
          const toNow = toBagWrapper.bag[denom] || 0;
          const fromRest = fromAvl - val;
          const toNew = toNow + val;
          logger.info({denom, fromAvl, fromRest, toNow, toNew});
          
          fromBagWrapper.bag[denom] = fromRest;
          toBagWrapper.bag[denom] = toNew;
          updateBag(fromBagWrapper, roomObjForMerge, gameState);
          updateBag(toBagWrapper, roomObjForMerge, gameState);          
        }
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
    const player = gameState.players.find(thisPlayer => { return thisPlayer.id == bagWrapper.playerId });
    player.moneyBag = structuredClone(bagWrapper.bag);

    roomObjForMerge.gameState = roomObjForMerge.gameState || gameState;
    roomObjForMerge.gameState.players = gameState.players;

    if(gameState.selectedPlayer?.id && gameState.selectedPlayer.id==bagWrapper.playerId ){
      gameState.selectedPlayer.moneyBag = bagWrapper.bag;
      roomObjForMerge.gameState.selectedPlayer = structuredClone(gameState.selectedPlayer);
    }
  }
}
function loadBagIntoWrapper(bagWrapper, gameState){
  if(bagWrapper.type=='bank'){
    logger.info('Load bank bag as bag');
    bagWrapper.bag = structuredClone(gameState.bankMoneyBag);
  }else if(bagWrapper.type=='uncle'){
    logger.info('Load uncle bag as bag');
    bagWrapper.bag = structuredClone(gameState.uncleMoneyBag);
  }else{
    logger.info('Load player bag as bag');
    const player = gameState.players.find(thisPlayer => { return thisPlayer.id == bagWrapper.playerId });
    bagWrapper.bag = structuredClone(player.moneyBag);
  }
}
function onBuyTileClicked(eventData, gameState, notifications, userObj){
    gameState.tileToOwnerMap[gameState.selectedTile.id] = gameState.selectedPlayer.id;
    
    logger.info("onBuyTileClicked: Proceeding with ", { 
      tileId: gameState.selectedTile.id, toPlayerId: gameState.selectedPlayer.id 
    });
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.tileToOwnerMap = structuredClone(gameState.tileToOwnerMap);

    const player = gameState.selectedPlayer;
    const tile = gameState.selectedTile;   
    const message = `Player ${player.name} bought tile ${tile.name}!`;
    roomObjForMerge.notifications = notifications;
    roomObjForMerge.notifications.unshift(message);
    return roomObjForMerge;
}
function onAddBoothClicked(eventData, gameState, notifications, userObj){
    const booths = gameState.tileToBoothMap[gameState.selectedTile.id] || 0;
    if(booths >= 2) {
      const message = `Tile ${tile.name} already has 2 booths!`;
      
      logger.info("onAddBoothClicked: Proceeding with ", { selTileId: gameState.selectedTile.id, oriBoothCount: booths });
      const roomObjForMerge = {};
      roomObjForMerge.notifications = notifications;
      roomObjForMerge.notifications.unshift(message);
      return roomObjForMerge;
    } else {
      let newBoothCount = booths + 1;
      gameState.tileToBoothMap[gameState.selectedTile.id] = newBoothCount;
      
      logger.info("onAddBoothClicked: Proceeding with ", { selTileId: gameState.selectedTile.id, newBoothCount });
      const roomObjForMerge = {};
      roomObjForMerge.gameState = {};
      roomObjForMerge.gameState.tileToBoothMap = gameState.tileToBoothMap;

      const player = gameState.selectedPlayer;
      const tile = gameState.selectedTile;
      const message = `Player ${player.name} added booth on tile ${tile.name}!`;
      roomObjForMerge.notifications = notifications;
      roomObjForMerge.notifications.unshift(message);
      return roomObjForMerge;
    }
}
function onRemoveBoothClicked(eventData, gameState, notifications, userObj){
    const booths = gameState.tileToBoothMap[gameState.selectedTile.id] || 0;
    if(booths < 1) {
      const message = `Tile ${tile.name} has no booths!`;
      
      logger.info("onRemoveBoothClicked: Proceeding with ", { selTileId: gameState.selectedTile.id, oriBoothCount: booths });
      const roomObjForMerge = {};
      roomObjForMerge.notifications = notifications;
      roomObjForMerge.notifications.unshift(message);
      return roomObjForMerge;
    } else {
      let newBoothCount = booths - 1;
      gameState.tileToBoothMap[gameState.selectedTile.id] = newBoothCount;
      
      logger.info("onRemoveBoothClicked: Proceeding with ", { selTileId: gameState.selectedTile.id, newBoothCount });
      const roomObjForMerge = {};
      roomObjForMerge.gameState = {};
      roomObjForMerge.gameState.tileToBoothMap = gameState.tileToBoothMap;

      const player = gameState.selectedPlayer;
      const tile = gameState.selectedTile;
      const message = `Player ${player.name} removed booth on tile ${tile.name}!`;
      roomObjForMerge.notifications = notifications;
      roomObjForMerge.notifications.unshift(message);
      return roomObjForMerge;
    }
}
function onStartGameClicked(eventData, gameState, notifications, userObj){
    if(gameState.players.length < 2){
        gameState.status = 'ADD_PLAYER';
    }else{
        gameState.status = 'ACTIVE';
    }

    logger.info("onStartGameClicked: Proceeding with ", { 
      status: gameState.status, playersCountForCheck: gameState.players.length 
    });
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.status = gameState.status;
    return roomObjForMerge;
}
function onShowTallyClicked(eventData, gameState, notifications, userObj){
    gameState.status = 'SHOW_TALLY';

    logger.info("onShowTallyClicked: Proceeding with ", { status: gameState.status });
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.status = gameState.status;
    return roomObjForMerge;
}
function onShowInstructionsClicked(eventData, gameState, notifications, userObj){
    gameState.status = 'SHOW_INSTRUCTIONS';

    logger.info("onShowInstructionsClicked: Proceeding with ", { status: gameState.status });
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.status = gameState.status;
    return roomObjForMerge;
}
function onTallyOrInstructionsClosed(eventData, gameState, notifications, userObj){
    if(gameState.players.length < 2){
        gameState.status = 'ADD_PLAYER';
    }else{
        gameState.status = 'ACTIVE';
    }
    
    logger.info("onTallyOrInstructionsClosed: Proceeding with ", { 
      status: gameState.status, playersCountForCheck: gameState.players.length 
    });
    const roomObjForMerge = { gameState: {} };
    roomObjForMerge.gameState.status = gameState.status;
    return roomObjForMerge;
}
function onPlayerAdded({playerColor}, gameState, notifications, userObj){
    const player = {
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
    
    logger.info("onPlayerAdded: Proceeding with ", { 
      player, playersLen: gameState.players.length, playerTileId: 
      gameState.playerToTileMap[player.id], gameSelPlayer: gameState.selectedPlayer, gameStatus: gameState.status
     });
    const roomObjForMerge = { gameState: {}, notifications };
    roomObjForMerge.gameState.players = gameState.players;
    roomObjForMerge.gameState.playerToTileMap = gameState.playerToTileMap;
    roomObjForMerge.gameState.selectedPlayer = gameState.selectedPlayer;
    roomObjForMerge.gameState.status = gameState.status;
    roomObjForMerge.notifications.unshift(message);
    return roomObjForMerge;
}

function postOnlyNotificationMessage(message, notifications){
  const roomObjForMerge = { notifications };
  roomObjForMerge.notifications.unshift(message);
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
  else if(eventName == 'removeBoothClicked')
    roomObjForMerge = onRemoveBoothClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'startGameClicked')
    roomObjForMerge = onStartGameClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'showTallyClicked')
    roomObjForMerge = onShowTallyClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'tallyClosed')
    roomObjForMerge = onTallyOrInstructionsClosed(eventData, gameState, notifications, userObj);
  else if(eventName == 'showInstructionsClicked')
    roomObjForMerge = onShowInstructionsClicked(eventData, gameState, notifications, userObj);
  else if(eventName == 'instructionsClosed')
    roomObjForMerge = onTallyOrInstructionsClosed(eventData, gameState, notifications, userObj);
  else if(eventName == 'playerAdded')
    roomObjForMerge = onPlayerAdded(eventData, gameState, notifications, userObj); //Move them out of Game events

  return roomObjForMerge;
}

/** Since Firebase does a deep-merge, we need this Fn to keep old props nulled-out */
function nullExistingProps(inObj){
  return Object.fromEntries(
    Object.keys(inObj).map(k => [k, null])
  );
}

exports.handleEvent = async function(eventName, eventData, roomObj, userObj){
    logger.info('Locking..');
    //Locked in client-side direct db update now.
    //await db.doc(`rooms/${roomObj.roomId}`).set({ locked:true }, { merge: true });
    //await sleep(1000);

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
      roomObjForMerge.locked = false;
      await db.doc(`rooms/${roomObj.roomId}`).set(roomObjForMerge, { merge: true });
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
