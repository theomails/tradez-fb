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
import dbservice from '../dbservice';

export default {
    props: ['roomId'],
    data(){
        return {
            gameData: {
                allTiles: data.getAllTiles()
            },
            newGameState: {
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
            }
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
        }
    },
    mounted(){
        eventBus.$on('playerClicked', this.onPlayerClicked);
        eventBus.$on('playerRollClicked', this.onPlayerRollClicked);
        eventBus.$on('playerMoveClicked', this.onPlayerMoveClicked);
        eventBus.$on('pickCardClicked', this.onPickCardClicked);
        eventBus.$on('cardCloseClicked', this.onCloseCardClicked);
        eventBus.$on('tileClicked', this.onTileClicked);
        eventBus.$on('jumpHereClicked', this.onJumpHereClicked);
        eventBus.$on('transferClicked', this.onTransferClicked);
        eventBus.$on('buyTileClicked', this.onBuyTileClicked);
        eventBus.$on('addBoothClicked', this.onAddBoothClicked);
        eventBus.$on('addPlayerClicked', this.onAddPlayerClicked);
        eventBus.$on('startGameClicked', this.onStartGameClicked);
        eventBus.$on('showTallyClicked', this.onShowTallyClicked);
        eventBus.$on('tallyClosed', this.onTallyClosed);
        eventBus.$on('playerAdded', this.onPlayerAdded);
        eventBus.$on('addPlayerCancelled', this.onAddPlayerCancelled);

        this.gameState.status = 'ADD_PLAYER';
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