<template>
    <div class="my-game-board" v-if="localGameState">
        <AddPlayerPane :gameState="localGameState"></AddPlayerPane>
        <TallyPane :gameState="localGameState" :gameData="gameData"></TallyPane>
        <div class="my-gb-top">
            <TileStrip direction="horizontal" :gameData="gameData" :gameState="localGameState" 
                :fromTileIdx="16" :toTileIdx="26"></TileStrip>
        </div>
        <div class="my-gb-middle">
            <div class="my-gb-left">
                <TileStrip direction="vertical" :gameData="gameData" :gameState="localGameState" 
                    :fromTileIdx="15" :toTileIdx="11"></TileStrip>
            </div>
            <div class="my-gb-center">
                <CenterPanels :gameState="localGameState" :messages="localNotifications"
                    :gameData="gameData"></CenterPanels>
            </div>
            <div class="my-gb-right">
                <TileStrip direction="vertical" :gameData="gameData" :gameState="localGameState" 
                    :fromTileIdx="27" :toTileIdx="31"></TileStrip>
            </div>
        </div>
        <div class="my-gb-bottom">
            <TileStrip direction="horizontal" :gameData="gameData" :gameState="localGameState" 
                :fromTileIdx="10" :toTileIdx="0"></TileStrip>
        </div>
    </div>
</template>
<script>
import TileStrip from './TileStrip.vue';
import CenterPanels from './CenterPanels.vue';
import AddPlayerPane from './AddPlayerPane.vue';
import TallyPane from './TallyPane.vue';
import data from "@/data.js";
import money from "@/money.js";
import dbservice from '../dbservice';
import {eventBus} from '@/main.js';

export default {
    props: ['roomObj', 'localUser'],
    data(){
        return {
            gameData: {
                allTiles: data.getAllTiles()
            },
            localRoomObj: null,
            localGameState: null,
            localNotifications: null
        };
    },
    methods:{
        movePlayerIdToTileId(playerId, tileId){
            var playerToTileMap = this.clone(this.localGameState.playerToTileMap); //Reactivity hack?
            playerToTileMap[playerId] = tileId;
            this.localGameState.playerToTileMap = playerToTileMap;

            var player = this.localGameState.players.find(thisPlayer => { return thisPlayer.id == playerId });
            var tile = this.gameData.allTiles.find(thisTile => { return thisTile.id == tileId });
            this.postMessage(`Player ${player.name} moved to tile ${tile.name}.`);
        },
        onPlayerClicked({player}){
            console.log('onPlayerClicked');
            this.localGameState.selectedPlayer = player;
        },
        onPlayerRollClicked(){
            console.log('onPlayerRollClicked');
            this.localGameState.currentRolledDice = (Math.floor(Math.random() * 6) + 1);
            const message = `Player ${this.localGameState.selectedPlayer.name} rolled a ${this.localGameState.currentRolledDice}.`;
            console.log(this.localGameState.currentRolledDice, message);
            this.postMessage(message);
        },
        onPlayerMoveClicked(){
            console.log('onPlayerMoveClicked');
            //Grab
            var rolledVal = this.localGameState.currentRolledDice;
            this.localGameState.currentRolledDice = null;
            //Find player id
            var selPlayerId = this.localGameState.selectedPlayer.id;
            //Find tile
            var tileIdOfPlayer = this.localGameState.playerToTileMap[this.localGameState.selectedPlayer.id];
            var tile = this.gameData.allTiles.find(thisTile => { return thisTile.id == tileIdOfPlayer });
            var tileIdx = this.gameData.allTiles.indexOf(tile);
            //Calc next tile idx
            var nextTileIdx = (tileIdx + rolledVal) % this.gameData.allTiles.length;
            //Assign values
            this.localGameState.selectedTile = this.gameData.allTiles[nextTileIdx];
            this.movePlayerIdToTileId(selPlayerId, this.localGameState.selectedTile.id);
        },
        onPickCardClicked(){
            console.log('onPickCardClicked')
            var availableChanceCards = this.localGameState.availableChanceCards;
            var pickedIdx = Math.floor(Math.random() * (availableChanceCards.length - 0.01));
            var cards = availableChanceCards.splice(pickedIdx, 1);
            this.localGameState.selectedChanceCard = cards[0];
            this.localGameState.availableChanceCards = availableChanceCards;
            this.postMessage(`Player ${this.localGameState.selectedPlayer.name} picked chance card: ${this.localGameState.selectedChanceCard}.`);
        },
        onCloseCardClicked(){
            console.log('onCloseCardClicked');
            this.localGameState.selectedChanceCard = null;
        },
        onTileClicked({tileId}){
            console.log('onTileClicked');
            var tile = this.gameData.allTiles.find(thisTile => { return thisTile.id == tileId });
            this.localGameState.selectedTile = tile;
        },
        onJumpHereClicked(){
            console.log('onJumpHereClicked');
            var tile = this.localGameState.selectedTile;
            var player = this.localGameState.selectedPlayer;
            this.movePlayerIdToTileId(player.id, tile.id);
        },
        onTransferClicked({fromBagOption, toBagOption, fromOps, toOps, transferSummaryText}){
            console.log('onTransferClicked');
            this.runOpsAndSave(fromBagOption, toBagOption, fromOps);
            this.runOpsAndSave(toBagOption, fromBagOption, toOps);
            this.postMessage(`Transferred ${transferSummaryText}.`);
        },
        runOpsAndSave(fromBagWrapper, toBagWrapper, ops){
            console.log(fromBagWrapper);
            console.log(toBagWrapper);
            console.log(ops);
            Object.keys(ops).forEach(denom => {
                var val = ops[denom] || 0;
                var avl = fromBagWrapper.bag[denom] || 0;
                var now = toBagWrapper.bag[denom] || 0;
                var rest = avl - val;
                var newNow = now + val;
                fromBagWrapper.bag[denom] = rest;
                toBagWrapper.bag[denom] = newNow;
                this.updateBag(fromBagWrapper);
                this.updateBag(toBagWrapper);
            });
        },
        updateBag(bagWrapper){
            if(bagWrapper.type=='bank'){
                console.log('Update bank');
                this.localGameState.bankMoneyBag = this.clone(bagWrapper.bag);
            }else if(bagWrapper.type=='uncle'){
                console.log('Update uncle');
                this.localGameState.uncleMoneyBag = this.clone(bagWrapper.bag);
            }else{
                var player = this.localGameState.players.find(thisPlayer => { return thisPlayer.id == bagWrapper.playerId });
                console.log('Update player');
                player.moneyBag = this.clone(bagWrapper.bag);
            }
        },
        onBuyTileClicked(){
            console.log('onBuyTileClicked');
            this.localGameState.tileToOwnerMap[this.localGameState.selectedTile.id] = this.localGameState.selectedPlayer.id;
            this.localGameState.tileToOwnerMap = this.clone(this.localGameState.tileToOwnerMap);
            var player = this.localGameState.selectedPlayer;
            var tile = this.localGameState.selectedTile;
            this.postMessage(`Player ${player.name} bought tile ${tile.name}!`);
        },
        onAddBoothClicked(){
            console.log('onAddBoothClicked');
            var booths = this.localGameState.tileToBoothMap[this.localGameState.selectedTile.id] || 0;
            if(booths >= 2) return;

            this.localGameState.tileToBoothMap[this.localGameState.selectedTile.id] = booths + 1;
            this.localGameState.tileToBoothMap = this.clone(this.localGameState.tileToBoothMap);
            var player = this.localGameState.selectedPlayer;
            var tile = this.localGameState.selectedTile;
            this.postMessage(`Player ${player.name} added booth on tile ${tile.name}!`);
        },
        onAddPlayerClicked(){
            console.log('onAddPlayerClicked');
            this.localGameState.status = 'ADD_PLAYER';
        },
        onStartGameClicked(){

        },
        onShowTallyClicked(){
            console.log('onShowTallyClicked');
            this.localGameState.status = 'SHOW_TALLY';
        },
        onTallyClosed(){
            console.log('onTallyClosed');
            if(this.localGameState.players.length < 2){
                this.localGameState.status = 'ADD_PLAYER';
            }else{
                this.localGameState.status = 'ACTIVE';
            }
        },
        onPlayerAdded({playerName, playerColor}){
            console.log('onPlayerAdded');
            if(playerName != this.localUser.userName){
                playerName = `${playerName} (${this.localUser.userName})`;
            }
            var player = {
                id: this.localUser.userId,
                name: playerName,
                color: playerColor,
                moneyBag:  money.getDefaultPlayerMoneyBag()
            };

            this.localGameState.players.push(player);
            this.localGameState.players = this.clone(this.localGameState.players);
            
            this.localGameState.playerToTileMap[player.id] = this.gameData.allTiles[0].id;
            this.localGameState.playerToTileMap = this.clone(this.localGameState.playerToTileMap);

            if(this.localGameState.players.length==1){
                this.localGameState.selectedPlayer = this.localGameState.players[0];
            }
            if(this.localGameState.players.length < 2){
                this.localGameState.status = 'ADD_PLAYER';
            }else{
                this.localGameState.status = 'ACTIVE';
            }
            this.postMessage(`Player ${player.name} added.`);
        },
        onAddPlayerCancelled(){
            console.log('onAddPlayerCancelled');
            if(this.localGameState.players.length >= 2){
                this.localGameState.status = 'ACTIVE';
            }
        },
        postMessage(msg){
            if(!msg) return;
            this.$notify({
                    message: msg,
                    type: "info",
                    top: true,
                    bottom: false,
                    left: true,
                    right: false,
                    showClose: true,
                    closeDelay: 4500
                });
            
            this.localNotifications.unshift(msg);
        },
        clone(obj){
            return JSON.parse(JSON.stringify(obj));
        },
        async saveGameStateInDb(){
            await dbservice.updateGameInRoom(this.roomObj.roomId, this.localGameState);
        },
        async saveNotificationsInDb(){
            await dbservice.updateNotificationsInRoom(this.roomObj.roomId, this.localNotifications);
        },
        grabRoomFromProps(){
            this.localRoomObj = this.roomObj;
            this.localGameState = this.localRoomObj?.gameState;
            this.localNotifications = this.localRoomObj?.notifications;            
        },
        setupEventHandler(eventName, eventHandler){
            eventBus.on(eventName, async (eventArgs)=>{
                let allowed = false;
                console.log('Checking event..', eventName, eventArgs);
                if(this.localGameState.selectedPlayer 
                    && this.localGameState.selectedPlayer.id == this.localUser.userId){
                        allowed = true;
                } else if(eventName=='playerAdded') {
                    let foundPlayer = this.localGameState.players.find(player => player.userId==this.localUser.userId);
                    console.log('foundPlayer ', foundPlayer);
                    if(!foundPlayer){
                        allowed = true;
                    }
                } else if(eventName=='addPlayerCancelled' || eventName=='startGameClicked') {
                    if(this.localGameState.owner.userId == this.localUser.userId){
                        allowed = true;
                    }
                } else if(eventName=='playerClicked') {
                    const player = eventArgs.player;
                    if(player.userId == this.localUser.userId){
                        allowed = true;
                    } 
                }

                if(allowed){
                    console.log('Allowed..');
                    eventHandler(eventArgs);
                    console.log('Saving..');
                    await this.saveGameStateInDb();
                    await this.saveNotificationsInDb();
                }
            });
        }
    },
    watch: {
        roomObj(){
            this.grabRoomFromProps();
        }
    },
    mounted(){
        try {
            this.setupEventHandler('playerClicked', this.onPlayerClicked);
            this.setupEventHandler('playerRollClicked', this.onPlayerRollClicked);
            this.setupEventHandler('playerMoveClicked', this.onPlayerMoveClicked);
            this.setupEventHandler('pickCardClicked', this.onPickCardClicked);
            this.setupEventHandler('cardCloseClicked', this.onCloseCardClicked);
            this.setupEventHandler('tileClicked', this.onTileClicked);
            this.setupEventHandler('jumpHereClicked', this.onJumpHereClicked);
            this.setupEventHandler('transferClicked', this.onTransferClicked);
            this.setupEventHandler('buyTileClicked', this.onBuyTileClicked);
            this.setupEventHandler('addBoothClicked', this.onAddBoothClicked);
            this.setupEventHandler('addPlayerClicked', this.onAddPlayerClicked); //Move them out of Game events
            this.setupEventHandler('startGameClicked', this.onStartGameClicked);
            this.setupEventHandler('showTallyClicked', this.onShowTallyClicked);
            this.setupEventHandler('tallyClosed', this.onTallyClosed);
            this.setupEventHandler('playerAdded', this.onPlayerAdded); //Move them out of Game events
            this.setupEventHandler('addPlayerCancelled', this.onAddPlayerCancelled); //Move them out of Game events

            this.grabRoomFromProps();
            if(this.localUser.userId == this.localRoomObj?.owner?.userId){
                this.localGameState.status = 'ADD_PLAYER';
                this.saveGameStateInDb();
            }            
        } catch (err) {
            console.log(err);
        }
    },
    components:{
        TileStrip,
        CenterPanels,
        AddPlayerPane,
        TallyPane
    },
    errorCaptured(err, vm, info) {
        console.error('captured', err, info);
        return false; // false to propagate
    }
}
</script>
<style>
.my-game-board{
    width: 100vw;
    height: 100vh;
    margin: 0px;
    padding: 0px;

    display:flex;
    flex-direction: column;
}
.my-gb-middle{
    flex: 1;
    display: flex;
    margin: 0px;
}
.my-gb-center{
    flex: 1;
}
.my-gb-left, .my-gb-right{
    width: calc(100vw/11);
}
</style>