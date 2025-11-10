<template>
    <div class="my-center-panels">
        <div class="my-center-left">
            <PlayersDisplay :gameState="gameState" :gameData="gameData"></PlayersDisplay>
            <ChanceDisplay :gameState="gameState"></ChanceDisplay>
            <MessagesDisplay class="func-flex-grow" :gameState="gameState"></MessagesDisplay>
            
        </div>
        <div class="my-center-right">
            <TileDisplay :gameState="gameState"></TileDisplay>
            <MainBagsDisplay :gameState="gameState"></MainBagsDisplay>
            <TransferDisplay :gameState="gameState"></TransferDisplay>
        </div>
    </div>
</template>
<script>
import PlayersDisplay from './PlayersDisplay.vue';
import TileDisplay from './TileDisplay.vue';
import ChanceDisplay from './ChanceDisplay.vue';
import MainBagsDisplay from './MainBagsDisplay.vue';
import TransferDisplay from './TransferDisplay.vue';
import MessagesDisplay from './MessagesDisplay.vue';

export default{
    props: ["gameState", "gameData"],
    components: {
        PlayersDisplay, 
        TileDisplay,
        ChanceDisplay,
        MainBagsDisplay,
        TransferDisplay,
        MessagesDisplay
    }
}
</script>
<style>
.my-center-panels{
    display: flex;
    height: calc(100% - 15px);
    max-height: calc(100vh * 5.5 / 8);
    overflow: auto;
    margin: 10px;
    margin-bottom: 0px;
    padding: 5px;
    
}
.my-center-panels > div{
    flex:1;
    height: 100%;
}
.my-center-panels > div > div{
    background-color: rgba(242, 220, 178, 1) !important;
    margin: 3px 10px;
}
.my-center-panels > div > div {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}
.my-center-right{
    display: flex;
    flex-direction: column;
}
</style>