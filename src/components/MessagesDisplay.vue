<template>
    <div class="my-msg-display">
        <div class="my-msg-display-title">
            <span class="func-flex-grow"><b>Game Activity:</b></span>
            <button @click="onAddPlayerClick">Add Player</button>
            <!-- <button @click="onStartGame">Start Game</button> -->
            <button @click="onShowTally">Show Tally</button>
            <!-- <button @click="onResetGame">Reset Game</button> -->
        </div>
        <select size="10">
            <option v-for="(message, idx) in gameState.messages" :key="idx">{{ message }}</option>
        </select>
    </div>
</template>
<script>
import {eventBus} from '@/main.js';

export default {
    props: ['gameState'],
    data(){
        return {

        };
    },
    methods:{
        onAddPlayerClick(){
            eventBus.$emit('addPlayerClicked');
        },
        onStartGame(){
            eventBus.$emit('startGameClicked');
        },
        onShowTally(){
            eventBus.$emit('showTallyClicked');
        },
        onResetGame(){
            eventBus.$emit('resetGameClicked');
        }
    },
    computed:{
        activityText(){
            var text = '';
            this.gameState.messages.forEach(message => {
                text = message + '\n' + text;
            });
            return text;
        }
    }
}
</script>
<style>
.my-msg-display{
    display: flex;
    flex-direction: column;

    padding: 10px;
    margin: 10px;
    border-radius: 4px;
    background-color: rgb(116, 239, 214);
}
.my-msg-display-title{
    display: flex;
}
.my-msg-display-title button{
    margin-left: 10px;
}
.my-msg-display select{
    flex: 1;
    margin: 10px 0px;
    padding: 10px;
    border: 1px solid #bbb;
    font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>