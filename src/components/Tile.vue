<template>
    <div class="my-tile" :class="{'my-tile-selected':isThisTileSelected}" @click="onTileClick()">
        <div class="my-tile-title" 
            :style="{backgroundColor: getBgColor(tile.color), color: getTextColor(tile.color)}"
            :title="tile.color"><b>{{ tile.name }}</b>
            <div v-if="thisTileOwnerName || thisTileBoothsCount">
                <span>{{ thisTileOwnerName }}</span>&nbsp;
                <span v-if="thisTileBoothsCount">Booths: {{ thisTileBoothsCount }}</span>
            </div>
        </div>
        <div v-if="tile.buyable">
            Cost: ${{ parseInt(tile.priceOrCharge) }}
        </div>
        <div class="my-tile-desc">
            {{ tile.description }}
        </div>
        <div class="my-tile-spacer func-flex-grow"></div>
        <div class="my-tile-players" v-if="mode == 'strip'" >
            <div class="my-player-in-tile" 
                    v-for="player in playersOnThisTile" :key="player.id"
                    :class="{'my-player-in-tile-selected': player.id==gameState.selectedPlayer.id}" 
                    :style="{backgroundColor: player.color }"
                >{{ player.name }}</div>
        </div>
        <div v-if="tile.buyable">
            Base Rent: ${{ parseInt(tile.baseRent) }}
        </div>
    </div>
</template>
<script>
import {eventBus} from "@/main.js";

export default {
    props:[ "tile", "gameState", "mode"],
    data(){
        return {
            darkColors: ["BLUE", "RED", "GREEN"],
            cssColor:{
                "SUBTLE_BLUE": "#00e4ff",
                "DARK_BLUE": "#d600ff"
            }
        };
    },
    methods:{
        onTileClick(){
            eventBus.$emit('tileClicked', this.tile?.id);
        },
        getTextColor(bgColor){
            if(this.darkColors.includes(bgColor)){
                return "white";
            }
            return "black";
        },
        getBgColor(colorName){
            return this.cssColor[colorName] || colorName;
        }
    },
    mounted(){
        //console.log(this.tile);
    },
    watch:{
        'gameState.playerToTileMap'(){
            console.log('Map changed');
        }
    },
    computed:{
        isThisTileSelected(){
            if(!this.tile) return false;
            var selectedTileId = this.gameState.selectedTile?.id;
            return selectedTileId && (selectedTileId==this.tile?.id);
        },
        playersOnThisTile(){
            //console.log(this.tile?.id);
            if(!this.tile) return [];
            var playersOnThisTile = [];
            try{
                //console.log(this.tile?.id);
                var playerIdToTileIdMap = this.gameState.playerToTileMap;
                
                Object.keys(playerIdToTileIdMap).forEach(playerId => {
                    var tileIdOfThisPlayer = playerIdToTileIdMap[playerId] || -1;
                    //console.log(playerId + '::' + tileIdOfThisPlayer);
                    if(tileIdOfThisPlayer == this.tile?.id){
                        var matchingPlayer = this.gameState.players.find(player => {
                            return player.id == playerId;
                        });
                        playersOnThisTile.push(matchingPlayer);
                    }
                });
            }catch(e){
                console.log(e);
            }
            //console.log(playersOnThisTile);
            return playersOnThisTile;
        },
        thisTileBoothsCount(){
            if(!this.tile) return 0;
            var tileIdToBoothCountMap = this.gameState?.tileToBoothMap;
            return tileIdToBoothCountMap[this.tile?.id];
        },
        thisTileOwnerName(){
            if(!this.tile) return 0;
            var tileIdToOwnerIdMap = this.gameState?.tileToOwnerMap;
            var ownerId = tileIdToOwnerIdMap[this.tile.id];
            if(ownerId){
                var ownerPlayer = this.gameState.players.find(thisPlayer => { return thisPlayer.id == ownerId });
                return ownerPlayer?ownerPlayer.name : null;
            }
            return null;
        }
    }
}
</script>
<style>
.my-tile{
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    position: relative;
    height: 100%;
    padding: 7px;
    margin: 3px;
    background-color: white;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}
.my-tile.my-tile-selected{
    border: 2px solid blue;
}
.my-tile-title{
    margin:-7px; 
    margin-bottom: 10px; 
    padding: 5px;
    text-align: center;
}
.my-tile-title span{
    font-size: 0.9em;
}
.my-tile-desc{
    text-align: center;
}
.my-tile-players{
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    padding-bottom: 3px;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    
    font-weight: bold;
    overflow: auto;
    overflow-wrap: normal;
    white-space:normal; 
}
.my-player-in-tile{
    flex: 0;
    margin-bottom: 5px;
    padding: 0px 5px;
    opacity: 1;
    cursor: pointer;
    box-shadow: rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
}
.my-player-in-tile-selected{
    border: 1px solid white;
}
</style>