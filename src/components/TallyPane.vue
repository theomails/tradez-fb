<template>
    <div class="my-tally-pane" v-show="gameState.status=='SHOW_TALLY'">
        <div class="my-tally-popup func-popup">
            <div class="func-popup-title">
                Game Tally!
            </div>
            <div class="func-popup-content">
                <div v-for="player in gameState.players" :key="player.id" class="my-player-holdings">
                    <span>{{ player.name }}'s moneys:</span>
                    <BagDisplay :bag="player.moneyBag"></BagDisplay>
                    <PropertyDisplay :player="player" :gameState="gameState" :gameData="gameData"></PropertyDisplay>
                </div>
            </div>
            <div class="func-popup-action">
                <button @click="onClose">Close</button>
            </div>
        </div>
    </div>
</template>
<script>
import {eventBus} from '@/main.js';
import BagDisplay from './BagDisplay.vue';
import PropertyDisplay from './PropertyDisplay.vue';

export default{
    props: ['gameState', 'gameData'],
    data(){
        return {
        };
    },
    mounted(){
        
    },
    methods:{
        onClose(){
            eventBus.$emit('tallyClosed');
        }
    },
    components: {
        BagDisplay,
        PropertyDisplay
    }
}
</script>
<style>
.my-tally-pane{
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
    z-index: 100;
}
.func-popup{
    background-color: rgb(242, 204, 101);
}
.my-tally-pane .my-player-holdings{
    margin-bottom: 2px;
    font-size: 1.2em;
}
</style>