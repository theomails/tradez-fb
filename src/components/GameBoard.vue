<template>
    <div class="my-game-board" v-if="localGameState">
        <div class="my-disable-overlay" v-if="localRoomObj.locked">
            Proccessing...
        </div>
        <AddPlayerPane :gameState="localGameState" :user="localUser"></AddPlayerPane>
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
import {eventBus} from '@/main.js';
import backendhelper from '@/backendhelper.js';

export default {
    props: ['roomObj', 'localUser'],
    data(){
        return {
            gameData: {
                allTiles: data.getAllTiles()
            },
            localRoomObj: null,
            localGameState: null,
            localNotifications: null,
            notificationsUpdating: false
        };
    },
    methods:{
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
            this.notificationsUpdating = true;
            this.localNotifications.unshift(msg);
        },
        grabRoomFromProps(){
            this.localRoomObj = this.roomObj;
            this.localGameState = this.localRoomObj?.gameState;
            if(!this.notificationsUpdating){

                this.localNotifications = this.localRoomObj?.notifications;
            }            
        },
        publishNewNotifications(localNotifications, inNotifications){
            if(inNotifications.length > localNotifications.length){
                const numPublish = inNotifications.length - localNotifications.length;
                for(let i=(inNotifications.length - numPublish); i<inNotifications.length; i++){
                    console.log('Posting: ' + inNotifications[i]);
                    this.postMessage(inNotifications[i]);
                }
            }
        },
        setupEventHandler(eventName){
            eventBus.on(eventName, async (eventArgs)=>{
                await backendhelper.postCommandToRoom(this.localUser?.userId, this.roomObj?.roomId, eventName, eventArgs);
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
            this.setupEventHandler('playerClicked');
            this.setupEventHandler('playerRollClicked');
            this.setupEventHandler('playerMoveClicked');
            this.setupEventHandler('pickCardClicked');
            this.setupEventHandler('cardCloseClicked');
            this.setupEventHandler('tileClicked');
            this.setupEventHandler('jumpHereClicked');
            this.setupEventHandler('transferClicked');
            this.setupEventHandler('buyTileClicked');
            this.setupEventHandler('addBoothClicked');
            this.setupEventHandler('addPlayerClicked'); //Move them out of Game events
            this.setupEventHandler('startGameClicked');
            this.setupEventHandler('showTallyClicked');
            this.setupEventHandler('tallyClosed');
            this.setupEventHandler('playerAdded'); //Move them out of Game events
            this.setupEventHandler('addPlayerCancelled'); //Move them out of Game events

            this.grabRoomFromProps();
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
.my-disable-overlay{
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    top: 0px;
    left:0px;
    width: 100vw;
    height: 100vh;
    background-color: rgba(50, 50, 50, 0.6);
    color: white;
    font-size: 1.3em;
    z-index: 100;
}
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