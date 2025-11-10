<template>
    <div class="my-tile-strip" :class="`my-tile-strip-${direction}`">
        <div class="my-tile-strip-item" v-for="selectedTile in selectedTiles" :key="selectedTile.id">
            <Tile :tile="selectedTile" :gameState="gameState" mode="strip"></Tile>
        </div>
    </div>
</template>
<script>
import Tile from './Tile.vue'

export default{
    props: ["direction", "gameData", "gameState", "fromTileIdx", "toTileIdx"],
    data(){
        return {};
    },
    computed:{
        selectedTiles(){
            var allTiles = this.gameData.allTiles;
            
            var delta = this.fromTileIdx<=this.toTileIdx?1:-1;
            var count = Math.abs(this.toTileIdx - this.fromTileIdx) + 1;
            var selectedTiles = [];
            for(var i=0;i<count;i++){
                var idx = this.fromTileIdx + delta*i;
                selectedTiles.push(allTiles[idx]);
            }
            return selectedTiles;
        }
    },
    components:{
        Tile
    }
}
</script>
<style>
.my-tile-strip{
    display: flex;
    height: calc(100vh/7 - 3px);
    margin: 0px;
}
.my-tile-strip-vertical{
    flex-direction: column;
    justify-content: space-evenly;
    height: 100%;
}
.my-tile-strip-vertical > div{
    margin: 2px 0px; /* Somehow these items alone needed again setting the margin! */
}
.my-tile-strip-item{
    flex: 1;
    align-self: stretch;
}
.my-tile-strip-horizontal > .my-tile-strip-item{
    width: 0;
}
</style>