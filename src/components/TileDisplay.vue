<template>
    <div class="my-tile-expanded">
        <Tile :tile="gameState.selectedTile" :gameState="gameState" mode="display"></Tile>
        <div class="my-tile-expanded-actions">
            <button @click="onJumpHereClick">Jump Here</button>
            <button :disabled="!gameState.selectedTile.buyable" @click="onBuyTileClick">Buy</button>
            <button :disabled="!gameState.selectedTile.buyable" @click="onAddBoothClick">Add Booth</button>
        </div>
    </div>
</template>
<script>
import Tile from './Tile.vue';
import {eventBus} from '@/main.js';

export default{
    props: ["gameState"],
    methods:{
        onJumpHereClick(){
            eventBus.$emit('jumpHereClicked');
        },
        onBuyTileClick(){
            eventBus.$emit('buyTileClicked');
        },
        onAddBoothClick(){
            eventBus.$emit('addBoothClicked');
        }
    },
    components:{
        Tile
    }
}
</script>
<style>
.my-tile-expanded{
    padding: 10px;
    margin: 10px;
    border-radius: 4px;
    background-color: rgb(202, 120, 245);

    display: flex;
    justify-content: space-between;
}
.my-tile-expanded-actions{
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
}
.my-tile-expanded > .my-tile{
    width: 130px;
    min-height: 110px;
}
</style>