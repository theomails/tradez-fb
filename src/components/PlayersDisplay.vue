<template>
    <div class="my-players-display">
        
        <div class="my-pd-header ">
            <div class="my-players-list">
                <span class="my-center-big-font"><b>Players</b></span>
                <div class="my-player-in-list" 
                        v-for="player in gameState.players" :key="player.id"
                        :style="{backgroundColor: player.color }"
                        :class="{'my-sel-player': isSelectedPlayer(player)}"
                        @click="onPlayerClick(player)">
                    {{ player.name }}
                </div>
            </div>

            <div class="my-player-roll">
                <button v-if="gameState.selectedPlayer" @click="onRollClick" >Roll dice for <b>{{ gameState.selectedPlayer.name }}</b></button>
                <div class="func-flex-grow my-dice-outer" :class="{'my-dice-inactive': !gameState.currentRolledDice}">
                    <div class="my-dice-value">
                        <span>{{ gameState.currentRolledDice }}</span>
                    </div>
                </div>
                <button @click="onMoveClick" :disabled="!gameState.currentRolledDice">Move!</button>
            </div>            
        </div>

        <div class="my-player-holdings my-center-big-font">
            <span>{{ gameState.selectedPlayer.name }}'s tally:</span>
            <BagDisplay :bag="gameState.selectedPlayer.moneyBag"></BagDisplay>
            <PropertyDisplay :player="gameState.selectedPlayer" :gameState="gameState" :gameData="gameData"></PropertyDisplay>
        </div>
    </div>
</template>
<script>
import {eventBus} from '@/main.js'
import BagDisplay from './BagDisplay.vue';
import PropertyDisplay from './PropertyDisplay.vue';

export default{
    props: ["gameState", "gameData"],
    methods:{
        onPlayerClick(player){
            eventBus.emit('playerClicked', {player});
        },
        onRollClick(){
            eventBus.emit('playerRollClicked');
        },
        onMoveClick(){
            eventBus.emit('playerMoveClicked');
        },
        isSelectedPlayer(aPlayer){
            return aPlayer && this.gameState.selectedPlayer && (aPlayer.id == this.gameState.selectedPlayer.id);
        }
    },
    components:{
        BagDisplay,
        PropertyDisplay
    }
}
</script>
<style>
.my-players-display{
    padding: 10px;
    margin: 10px;
    background-color: #18eda9;
    border-radius: 4px;
}
.my-pd-header{
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 5px;
}
.my-players-list{
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 10px;
}
.my-player-in-list{
    font-size: 1.2em;
    padding: 5px 10px;
    border: 1px solid #eee;
    margin: 0px 10px;
    cursor: pointer;
    box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}
.my-player-roll{
    flex: 1;
    display: inline-flex;
    align-items: center;
}
.my-dice-inactive .my-dice-value {
    display: none;
    opacity: 0.3;
    font-weight: normal;
}
.my-dice-value{
  display: flex;
  align-items: center;
  justify-content: center;    

  font-size: 1.5em;
  font-weight: bold;
  width: 22px;
  height: 22px;
  margin: auto;
  border: 1px solid lightgray;
  border-radius: 4px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}
.my-player-in-list.my-sel-player{
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    font-weight: bold;
}
.my-player-holdings{
    padding: 5px 10px;
    background-color: rgba(255, 255, 255, 0.5);
}
</style>