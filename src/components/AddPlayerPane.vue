<template>
    <div class="my-add-player-pane" v-show="!meAddedAsPlayer">
        <div class="my-add-player-popup func-popup">
            <div class="func-popup-title">
                Join the Game
            </div>
            <div class="func-popup-content">
                <div class="func-flex">
                    <div >Your player name will be:</div>
                    <div class="func-flex-grow func-flex-vertical" >
                        <input ref="playerNameTxt" class="my-player-name" type="text" disabled
                                    :value="playerName" @keypress="playerNameError = ''" @keyup.enter="onAddPlayer" />
                        <span v-if="playerNameError"  class="func-input-text-error" >
                            <br/>{{ playerNameError }}
                        </span>
                    </div>
                </div>
                
                <br/><br/>
                <div style="display: inline-block">Pick a color:</div>
                <div class="my-pcolor-list">
                    <div class="my-pcolor" 
                        v-for="pcolor in pastelColors" :key="pcolor" 
                        :value="pcolor" :style="{backgroundColor: pcolor}"
                        :class="{'my-pcolor-selected': pcolor==playerColor}"
                        @click="colorSelected(pcolor)"
                        >
                        &nbsp;
                    </div>
                </div>
                <br/><br/>
            </div>
            <div class="func-popup-action">
                <button @click="onAddPlayer">Join Game</button>
                <button @click="onCancelAddPlayer">Cancel</button>
            </div>
        </div>
    </div>
</template>
<script>
import {eventBus} from '@/main.js';

export default{
    props: ['gameState', 'user'],
    data(){
        return {
            playerNameError: '',
            playerColor: '',
            pastelColors: [
                "#aaf0d1", // magic mint
                "#ffd3b6", // melon
                "#ffb3de", // pink lace
                "#cf9fff", // mauve
                "#99c5c4" // pastel turquoise
            ]
        };
    },
    mounted(){
        var randColorIdx = Math.floor(Math.random() * (this.pastelColors.length));
        this.playerColor = this.pastelColors[randColorIdx];

        if(this.$refs.playerNameTxt){
            this.$refs.playerNameTxt.focus();
        }
    },
    computed: {
        playerName(){
            return this.user?.userName || '';
        },
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
    methods:{
        colorSelected(pcolor){
            this.playerColor = pcolor;
        },
        onAddPlayer(){
            if(!this.playerName || this.playerName.length <1){
                this.playerNameError = 'Please enter a player name!';
                return;
            }
            eventBus.emit('playerAdded', {playerName:this.playerName, playerColor:this.playerColor});
            //this.playerName = '';
            this.playerColor = this.pastelColors[0];
            this.$nextTick(()=>{
                if(this.$refs.playerNameTxt){
                    this.$refs.playerNameTxt.focus();
                }
            });
        },
        onCancelAddPlayer(){
            eventBus.emit('addPlayerCancelled');
        }
    }
}
</script>
<style>
.my-add-player-pane{
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    top: 0px;
    left:0px;
    width: 100vw;
    height: 100vh;
    padding: 0px;
    margin: 0px;
    background-color: rgba(50,50,50, 0.6);
    z-index: 100;
}
.my-player-name{
    padding: 5px 10px;
    margin-left: 10px;
    border: none;
    border-bottom: 1px solid #ccc;
    background-color: rgba(250,250,250, 0.6);
    outline: none;
}
.my-player-name:focus{
    border-bottom: 1px solid #1e0e94;
}
.my-pcolor-list{
    display: inline-flex;
    justify-content: center;
    width: 50%;
}
.my-pcolor{
    flex: 1;
    margin: 2px 10px;
    max-width: 80px;
    text-align: center;
    border: 1px solid #aaa;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}
.my-pcolor-selected{
    border: 2px solid #666;
}
.func-popup{
    width: 50%;
    min-height: 200px;
    background-color: white;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    border: 1px solid #aaa;
    border-radius: 5px;
    font-size: 1.2em;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.func-popup > div{
    padding: 20px;
}
.func-popup-title{
    font-weight: bold;
}
.func-popup .func-popup-content{
    flex: 1;
    padding-top: 0px;
}
.func-popup .func-popup-action{
    padding-top: 0px;
    display: flex;
    justify-content: center;
}
.func-popup-action button{
    margin: 0px 10px;
    padding: 5px 15px;
}
.func-input-text-error{
    font-size: 0.8em;
    color: rgb(205, 17, 46);
    line-height: 0.8em;
    margin-left: 10px;
}
.func-flex{
    display: flex;
    align-items: center;
}
.func-flex-vertical{
    display: flex;
    flex-direction: column;
}
</style>