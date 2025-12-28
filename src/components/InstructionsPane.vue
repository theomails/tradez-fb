<template>
    <div class="my-instructions-pane" v-if="gameState && gameState.status=='SHOW_INSTRUCTIONS'">
        <div class="my-instructions-popup func-popup">
            <div class="func-popup-title">
                Game Instructions!
            </div>
            <div class="func-popup-content">
                <div class="my-instructions">
                    <p><b>Game Start</b></p>
                    <ol>
                    <li>Each player starts with a total of $31 across different notes. Every player starts out on the START tile. Players take turns one by one to play.</li>
                    <li>Roll the dice, and click on Move to move the rolled number of tiles on the board. Depending on the tile the player lands, the player can take the next action.</li>
                    <li>Players go around the board in the clockwise direction.</li>
                    <li>Players can take turns one by one in the order they joined the room.</li>
                    </ol>
                    <p><b>Playing the Game</b></p>
                    <ol>
                    <li>Colored tiles can be bought if they are still available. Pay the Cost to BANK and then Buy the tile.</li>
                    <li>Chance tile allows you to pick one Chance card. Follow the instructions on the card. If you get a Free Ticket Booth card, and no tile of that color is available, you have to pick a Chance card again.</li>
                    <li>If you land on the Railway lines, follow the instructions on the tile!</li>
                    <li>If you land on the amusements - Water Show or Fireworks - pay to Uncle Pennybag's Loose Change, and enjoy the show!</li>
                    <li>Cafe is for you to just hang out.</li>
                    <li>Land on the Tram, and you get transported to Cafe! Pay ticket price to Uncle Pennybag's Loose Change.</li>
                    <li>Landing on Uncle Pennybag's Loose Change lets you pick up all the loose change!</li>
                    </ol>
                    <p><b>Collecting Incentives</b></p>
                    <ol>
                    <li>When you pass START, collect $2 from the Bank.</li>
                    <li>You can collect START money, even if you pass by START following an instruction to jump somewhere (if you pass START going clockwise from your current tile to the destination tile).</li>
                    </ol>
                    <p><b>Developed Tiles</b></p>
                    <ol>
                    <li>Each time you land again on a colored tile you own, you can add a booth (maximum of 2 booths per tile).</li>
                    <li>Each booth on the tile adds another Base rent. So, if you add two booths you can charge a total of three times of base rent!</li>
                    <li>If you own a pair of the same-colored tiles, then the rent doubles on each of the tiles. If you have two booths on one of the paired tiles, you can charge six times of the base rent!</li>
                    </ol>                       
                    <p><b>Trading Tiles</b></p>
                    <ol>
                    <li>Players can trade their tiles for money or do an exchange.</li>
                    <li>Tiles can be sold along with the booths on them to other players and not the BANK. Price can be negotiated among the players for both trade and exchange.</li>
                    <li>Trade can be done during the turn of either of the players - buyer or seller - and not during another player's turn.</li>
                    </ol>
                    <p><b>WINNING!</b></p>
                    <ol>
                    <li>Click on Show Tally to see the wealth tally of the players.</li>
                    <li>All players are ranked by their total wealth, adding up moneys and properties.</li>
                    <li>Player with the most total wealth wins!</li>
                    </ol>     
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
            eventBus.emit('instructionsClosed');
        }
    },
    components: {
    }
}
</script>
<style>
.my-instructions-pane{
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
.my-instructions{
    padding: 5px 15px;
    background-color: rgba(255, 255, 255, 0.6);
    overflow-y: auto;
    max-height: 50vh;
}

</style>