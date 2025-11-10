<template>
    <div class="my-bag-holdings">
        <span>Property :: </span>
        <template v-if="playerTileSummaries.length>0">
            <span v-for="summary in playerTileSummaries" :key="summary.tile.id">
                {{ `[${summary.tile.name} \$${summary.tile.priceOrCharge} + ${summary.boothCount} * \$${summary.tile.priceOrCharge}] ` }}
            </span>
            <span v-if="playerTileSummaries.length>0"> :: Total: ${{ totalValue }}</span>
        </template>
        <span v-else>
            No property yet!
        </span>
    </div>
</template>
<script>

export default{
    props: ["player", "gameState", "gameData"],
    data(){
        return {
            
        };
    },
    computed:{
        playerTileSummaries(){
            var tileIdToOwnerIdMap = this.gameState.tileToOwnerMap;
            var thisPlayerTiles = Object.keys(tileIdToOwnerIdMap).filter(thisTileId => {
                var tileOwnerId = tileIdToOwnerIdMap[thisTileId];
                return tileOwnerId && tileOwnerId == this.player.id;
            }).map(myTileId => {
                return this.gameData.allTiles.find(thisTile => { return thisTile.id == myTileId });
            });
            var summaries = [];
            thisPlayerTiles.forEach(tile => {
                var summary = {};
                summary.tile = tile;
                summary.boothCount = this.gameState.tileToBoothMap[tile.id] || 0;
                summaries.push(summary);
            });
            return summaries;
        },
        totalValue(){
            var total = 0;
            this.playerTileSummaries.forEach(summary => {
                total += summary.tile.priceOrCharge;
                total += summary.boothCount * summary.tile.priceOrCharge;
            });
            return total;
        }
    }
}
</script>
<style>

</style>