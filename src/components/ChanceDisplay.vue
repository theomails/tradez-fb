<template>
    <div class="my-chance-display">
        <div class="my-chance-base">
            <span class="my-chance-title"><b>Chance</b></span>
            <span class="func-flex-grow">Available chance cards #{{ gameState.availableChanceCards.length }}</span>
            <button @click="onPickCardClick" :disabled="gameState.selectedChanceCard" >Pick a Card</button>
        </div>
        <div class="my-chance-current" v-if="gameState.selectedChanceCard">
            <span>{{ gameState.selectedChanceCard }}</span>
            <button @click="onCloseCardClick">Close</button>
        </div>
    </div>
</template>
<script>
import {eventBus} from '@/main.js';

export default{
    props: ["gameState"],
    methods:{
        onPickCardClick(){
            eventBus.$emit('pickCardClicked');
        },
        onCloseCardClick(){
            eventBus.$emit('cardCloseClicked');
        }
    },
    components:{
    }
}
</script>
<style>
.my-chance-display{
    padding: 10px;
    margin: 10px;
    border-radius: 4px;
    background-color: rgb(241, 124, 190);

    display: flex;
    flex-direction: column;
}
.my-chance-title{
    margin-right: 20px;
}
.my-chance-base{
    display: flex;
    justify-content: space-between;
    padding: 10px;
}
.my-chance-current{
    display: flex;
    justify-content: space-between;
    padding: 15px 10px;
    background-color: rgba(255, 255, 255, 0.35);
}
</style>