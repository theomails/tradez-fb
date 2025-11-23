<template>
    <div class="my-game-board">
        <AddPlayerPane :gameState="gameState"></AddPlayerPane>
        <TallyPane :gameState="gameState" :gameData="gameData"></TallyPane>
        <div class="my-gb-top">
            <TileStrip direction="horizontal" :gameData="gameData" :gameState="gameState" 
                :fromTileIdx="16" :toTileIdx="26"></TileStrip>
        </div>
        <div class="my-gb-middle">
            <div class="my-gb-left">
                <TileStrip direction="vertical" :gameData="gameData" :gameState="gameState" 
                    :fromTileIdx="15" :toTileIdx="11"></TileStrip>
            </div>
            <div class="my-gb-center">
                <CenterPanels :gameState="gameState" :gameData="gameData"></CenterPanels>
            </div>
            <div class="my-gb-right">
                <TileStrip direction="vertical" :gameData="gameData" :gameState="gameState" 
                    :fromTileIdx="27" :toTileIdx="31"></TileStrip>
            </div>
        </div>
        <div class="my-gb-bottom">
            <TileStrip direction="horizontal" :gameData="gameData" :gameState="gameState" 
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
            var playerToTileMap = this.clone(this.gameState.playerToTileMap); //Reactivity hack?
            playerToTileMap[playerId] = tileId;
            this.gameState.playerToTileMap = playerToTileMap;

            var player = this.gameState.players.find(thisPlayer => { return thisPlayer.id == playerId });
            var tile = this.gameData.allTiles.find(thisTile => { return thisTile.id == tileId });
            this.postMessage(`Player ${player.name} moved to tile ${tile.name}.`);
        },
        onPlayerClicked(player){
            this.gameState.selectedPlayer = player;
        },
        onPlayerRollClicked(){
            this.gameState.currentRolledDice = (Math.floor(Math.random() * 6) + 1);
            this.postMessage(`Player ${this.gameState.selectedPlayer.name} rolled a ${this.gameState.currentRolledDice}.`);
        },
        onPlayerMoveClicked(){
            //Grab
            var rolledVal = this.gameState.currentRolledDice;
            this.gameState.currentRolledDice = null;
            //Find player id
            var selPlayerId = this.gameState.selectedPlayer.id;
            //Find tile
            var tileIdOfPlayer = this.gameState.playerToTileMap[this.gameState.selectedPlayer.id];
            var tile = this.gameData.allTiles.find(thisTile => { return thisTile.id == tileIdOfPlayer });
            var tileIdx = this.gameData.allTiles.indexOf(tile);
            //Calc next tile idx
            var nextTileIdx = (tileIdx + rolledVal) % this.gameData.allTiles.length;
            //Assign values
            this.gameState.selectedTile = this.gameData.allTiles[nextTileIdx];
            this.movePlayerIdToTileId(selPlayerId, this.gameState.selectedTile.id);
        },
        onPickCardClicked(){
            var availableChanceCards = this.gameState.availableChanceCards;
            var pickedIdx = Math.floor(Math.random() * (availableChanceCards.length - 0.01));
            var cards = availableChanceCards.splice(pickedIdx, 1);
            this.gameState.selectedChanceCard = cards[0];
            this.gameState.availableChanceCards = availableChanceCards;
            this.postMessage(`Player ${this.gameState.selectedPlayer.name} picked chance card: ${this.gameState.selectedChanceCard}.`);
        },
        onCloseCardClicked(){
            this.gameState.selectedChanceCard = null;
        },
        onTileClicked(tileId){
            var tile = this.gameData.allTiles.find(thisTile => { return thisTile.id == tileId });
            this.gameState.selectedTile = tile;
        },
        onJumpHereClicked(){
            var tile = this.gameState.selectedTile;
            var player = this.gameState.selectedPlayer;
            this.movePlayerIdToTileId(player.id, tile.id);
        },
        onTransferClicked(fromBagWrapper, toBagWrapper, fromOps, toOps, summaryText){
            console.log('Doing transfer');
            this.runOpsAndSave(fromBagWrapper, toBagWrapper, fromOps);
            this.runOpsAndSave(toBagWrapper, fromBagWrapper, toOps);
            this.postMessage(`Transferred ${summaryText}.`);
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
                this.gameState.bankMoneyBag = this.clone(bagWrapper.bag);
            }else if(bagWrapper.type=='uncle'){
                console.log('Update uncle');
                this.gameState.uncleMoneyBag = this.clone(bagWrapper.bag);
            }else{
                var player = this.gameState.players.find(thisPlayer => { return thisPlayer.id == bagWrapper.playerId });
                console.log('Update player');
                player.moneyBag = this.clone(bagWrapper.bag);
            }
        },
        onBuyTileClicked(){
            this.gameState.tileToOwnerMap[this.gameState.selectedTile.id] = this.gameState.selectedPlayer.id;
            this.gameState.tileToOwnerMap = this.clone(this.gameState.tileToOwnerMap);
            var player = this.gameState.selectedPlayer;
            var tile = this.gameState.selectedTile;
            this.postMessage(`Player ${player.name} bought tile ${tile.name}!`);
        },
        onAddBoothClicked(){
            var booths = this.gameState.tileToBoothMap[this.gameState.selectedTile.id] || 0;
            if(booths >= 2) return;

            this.gameState.tileToBoothMap[this.gameState.selectedTile.id] = booths + 1;
            this.gameState.tileToBoothMap = this.clone(this.gameState.tileToBoothMap);
            var player = this.gameState.selectedPlayer;
            var tile = this.gameState.selectedTile;
            this.postMessage(`Player ${player.name} added booth on tile ${tile.name}!`);
        },
        onAddPlayerClicked(){
            this.gameState.status = 'ADD_PLAYER';
        },
        onStartGameClicked(){

        },
        onShowTallyClicked(){
            this.gameState.status = 'SHOW_TALLY';
        },
        onTallyClosed(){
            if(this.gameState.players.length < 2){
                this.gameState.status = 'ADD_PLAYER';
            }else{
                this.gameState.status = 'ACTIVE';
            }
        },
        onPlayerAdded(pname, pcolor){
            if(pname != this.loginUser.userName){
                pname = `${pname} (${this.loginUser.userName})`;
            }
            var player = {
                id: this.loginUser.userId,
                name: pname,
                color: pcolor,
                moneyBag:  money.getDefaultPlayerMoneyBag()
            };

            this.gameState.players.push(player);
            this.gameState.players = this.clone(this.gameState.players);
            
            this.gameState.playerToTileMap[player.id] = this.gameData.allTiles[0].id;
            this.gameState.playerToTileMap = this.clone(this.gameState.playerToTileMap);

            if(this.gameState.players.length==1){
                this.gameState.selectedPlayer = this.gameState.players[0];
            }
            if(this.gameState.players.length < 2){
                this.gameState.status = 'ADD_PLAYER';
            }else{
                this.gameState.status = 'ACTIVE';
            }
            this.postMessage(`Player ${player.name} added.`);
        },
        onAddPlayerCancelled(){
            if(this.gameState.players.length >= 2){
                this.gameState.status = 'ACTIVE';
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
            
            this.gameState.messages.unshift(msg);
        },
        clone(obj){
            return JSON.parse(JSON.stringify(obj));
        },
        async saveGameStateInDb(){
            await updateGameInRoom(this.roomObj.roomId, this.localGameState);
        },
        async saveNotificationsInDb(){
            await updateNotificationsInRoom(this.roomObj.roomId, this.localNotifications);
        },
        grabRoomFromProps(){
            this.localRoomObj = this.roomObj;
            this.localGameState = this.localRoomObj.gameState;
            this.localNotifications = this.localRoomObj.notifications;            
        },
        setupEventHandler(eventName, eventHandler){
            eventBus.$on(eventName, async (...eventArgs)=>{
                let allowed = false;
                if(this.localGameState.selectedPlayer 
                    && this.localGameState.selectedPlayer.userId == this.localUser.userId){
                        allowed = true;
                } else if(eventName=='addPlayerClicked') {
                    let foundPlayer = this.localGameState.players.find(player => player.userId==this.localUser.userId);
                    if(!foundPlayer){
                        allowed = true;
                    }
                } else if(eventName=='addPlayerCancelled' || eventName=='startGameClicked') {
                    if(this.localGameState.owner.userId == this.localUser.userId){
                        allowed = true;
                    }
                } else if(eventName=='playerClicked') {
                    const player = eventArgs[0];
                    if(player.userId == this.localUser.userId){
                        allowed = true;
                    } 
                }

                if(allowed){
                    eventHandler();
                    await this.saveGameStateInDb();
                    await this.saveNotificationsInDb();
                }
            });
        }
    },
    mounted(){
        setupEventHandler('playerClicked', this.onPlayerClicked);
        setupEventHandler('playerRollClicked', this.onPlayerRollClicked);
        setupEventHandler('playerMoveClicked', this.onPlayerMoveClicked);
        setupEventHandler('pickCardClicked', this.onPickCardClicked);
        setupEventHandler('cardCloseClicked', this.onCloseCardClicked);
        setupEventHandler('tileClicked', this.onTileClicked);
        setupEventHandler('jumpHereClicked', this.onJumpHereClicked);
        setupEventHandler('transferClicked', this.onTransferClicked);
        setupEventHandler('buyTileClicked', this.onBuyTileClicked);
        setupEventHandler('addBoothClicked', this.onAddBoothClicked);
        setupEventHandler('addPlayerClicked', this.onAddPlayerClicked); //Move them out of Game events
        setupEventHandler('startGameClicked', this.onStartGameClicked);
        setupEventHandler('showTallyClicked', this.onShowTallyClicked);
        setupEventHandler('tallyClosed', this.onTallyClosed);
        setupEventHandler('playerAdded', this.onPlayerAdded); //Move them out of Game events
        setupEventHandler('addPlayerCancelled', this.onAddPlayerCancelled); //Move them out of Game events

        this.grabRoomFromProps();
        if(this.localUser.userId == this.localRoomObj.owner.userId){
            this.localGameState.status = 'ADD_PLAYER';
            this.saveGameStateInDb();
        }
    },
    components:{
        TileStrip,
        CenterPanels,
        AddPlayerPane,
        TallyPane
    }
}
</script>
<style>
.my-game-board{
    width: 100vw;
    height: 100vh;
    margin: 0px;
    padding: 5px;

    display:flex;
    flex-direction: column;
}
.my-gb-middle{
    flex: 1;
    display: flex;
    margin: 7px 0px;
}
.my-gb-center{
    flex: 1;
}
.my-gb-left, .my-gb-right{
    width: calc(100vw/11);
}
</style>