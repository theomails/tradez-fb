<template>
    <div class="my-msg-display">
        <div class="my-msg-display-title func-flex">
            <span class="func-flex-grow my-center-big-font"><b>Game Activity:</b></span>
            <button @click="onAddPlayerClick" disabled="meAddedAsPlayer">Add Player</button>
            <!-- <button @click="onStartGame">Start Game</button> -->
            <button @click="onShowTally">Show Tally</button>
            <button @click="onShowInstructions">🛈</button>
            <!-- <button @click="onUnlock" v-if="owner.userId == user.userId">🔓</button> -->
            <!-- <button @click="onResetGame">Reset Game</button> -->
        </div>
        <select size="10" ref="messagesList">
            <option v-for="(message, idx) in messages" :key="idx">{{ message }}</option>
        </select>
    </div>
</template>
<script>
import {eventBus} from '@/main.js';

export default {
    props: ['user', 'gameState', 'messages', 'roomId', 'owner'],
    data(){
        return {

        };
    },
    methods:{
        onAddPlayerClick(){
            eventBus.emit('addPlayerClicked');
        },
        onStartGame(){
            eventBus.emit('startGameClicked');
        },
        onShowTally(){
            eventBus.emit('showTallyClicked');
        },
        onShowInstructions(){
            eventBus.emit('showInstructionsClicked');
        },
        onResetGame(){
            eventBus.emit('resetGameClicked');
        },
        scrollToTopMessage() {
            console.log('Scrolling..', this.$refs.messagesList);
            this.$nextTick(() => {
                const el = this.$refs.messagesList;
                if (el) el.scrollTop = 0;
            });
        }
    },
    computed: {
        meAddedAsPlayer(){
            const players = this.gameState?.players;
            if(players){
                const mePlayer = players.find(player => player.id == this.user.userId);
                if(mePlayer){
                    return true;
                }
            }
            return false;
        }
    },
    watch: {
        messages(){
            this.scrollToTopMessage();
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