<template>
    <div class="my-players-display">
        
        <div class="my-pd-header">
            <div class="my-players-list">
                <span><b>Players</b></span>
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
                <span class="func-flex-grow my-dice-value">{{ gameState.currentRolledDice }}</span>
                <button @click="onMoveClick" :disabled="!gameState.currentRolledDice">Move!</button>
            </div>            
        </div>

        <div class="my-player-holdings">
            <span>{{ gameState.selectedPlayer.name }}'s moneys:</span>
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
            eventBus.$emit('playerClicked', player);
        },
        onRollClick(){
            eventBus.$emit('playerRollClicked');
        },
        onMoveClick(){
            eventBus.$emit('playerMoveClicked');
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
    margin-bottom: 5px;
}
.my-players-list{
    display: inline-flex;
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
.my-dice-value{
    padding: 0px 15px;
}
.my-player-in-list.my-sel-player{
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    font-weight: bold;
}
.my-player-holdings{
    padding: 5px 10px;
    background-color: rgba(255, 255, 255, 0.35);
}
</style>