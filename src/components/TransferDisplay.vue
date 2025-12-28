<template>
    <div class="my-transfer-display">
        <div class="my-transfer-header func-flex">
            <select class="my-transfer-from" v-model="fromBagId">
                <option v-for="bagOption in bagOptions" :key="bagOption.id" :value="bagOption.id">{{ bagOption.name }}</option>
            </select>
            &nbsp;to&nbsp;
            <select class="my-transfer-to" v-model="toBagId">
                <option v-for="bagOption in bagOptions" :key="bagOption.id" :value="bagOption.id">{{ bagOption.name }}</option>
            </select>
        </div>
        <div class="my-transfer-ops my-center-big-font">
            <OpsEditor :bagWrapper="getWrapperForBagId(fromBagId)" :neatOps="getNeatOps(fromOps)"
                @increment="perform('from', 'increment', $event)" @decrement="perform('from', 'decrement', $event)"></OpsEditor>
            <OpsEditor :bagWrapper="getWrapperForBagId(toBagId)" :neatOps="getNeatOps(toOps)"
                @increment="perform('to', 'increment', $event)" @decrement="perform('to', 'decrement', $event)"></OpsEditor>
        </div>
        <div class="my-transfer-footer">
            <span class="my-center-bigger-font">{{ transferSummaryText }}</span>
            <button @click="onTransferClick" :disabled="transferNetAmount==0">Transfer</button>
        </div>
    </div>
</template>
<script>
import money from '@/money.js';
import {eventBus} from '@/main.js';
import OpsEditor from './OpsEditor.vue';

export default {
    props: ["gameState"],
    data(){
        return {
            fromBagId: null,
            toBagId: null,
            fromOps: {},
            toOps: {}
        };
    },
    mounted(){
        this.fromBagId = this.bagOptions[0].id;
        this.toBagId = 'bank';
    },
    methods:{
        perform(source, action, {denom}){
            this.changeOpsBag(denom, action, source);
        }, 
        changeOpsBag(denom, incOrDec, opsFromOrTo){
            var ops = (opsFromOrTo=='from'?this.fromOps:this.toOps) || {};
            ops = JSON.parse(JSON.stringify(ops));
            ops[denom] = (ops[denom] || 0) + (incOrDec=='increment'?1:-1);
            ops[denom] = ops[denom]<0?0:ops[denom];
            if(opsFromOrTo=='from'){
                this.fromOps = ops;
            }else if(opsFromOrTo=='to'){
                this.toOps = ops;
            }
        },
        getWrapperForBagId(bagId){
            if(bagId){
                return this.bagOptions.find(bagOption => (bagOption.id == bagId));
            }
            return null;
        },
        getNeatOps(ops){
            return money.neatViewOfBag(ops);
        },
        getTotal(ops){
            var sum = 0;
            Object.keys(ops).forEach(denom => {
                sum += denom * ops[denom];
            });
            return sum;
        },
        onTransferClick(){
            let fromBagOption = this.getWrapperForBagId(this.fromBagId);
            let toBagOption = this.getWrapperForBagId(this.toBagId)
            eventBus.emit('transferClicked', 
                {
                    fromBagOption, toBagOption, 
                    fromOps: this.fromOps, toOps: this.toOps,
                    transferSummaryText: this.transferSummaryText
                });
            this.fromOps = {};
            this.toOps = {};
        }
    },
    watch:{
        'gameState.selectedPlayer'(){
            this.fromBagId = 'player-' + this.gameState.selectedPlayer.id;
            this.toBagId = 'bank';
        }
    },
    computed:{
        transferSummaryText(){
            var fromAmt = this.getTotal(this.fromOps);
            var toAmt = this.getTotal(this.toOps);
            var netAmount = fromAmt - toAmt;
            var fromName = this.getWrapperForBagId(this.fromBagId)?.name;
            var toName = this.getWrapperForBagId(this.toBagId)?.name;
            if(toAmt > fromAmt){
                var tmpAmount = fromAmt;
                fromAmt = toAmt;
                toAmt = tmpAmount;
                netAmount = fromAmt - toAmt;
                var tmpName = fromName;
                fromName = toName;
                toName = tmpName;
            }
            if(netAmount == 0){
                return 'Nothing to transfer.';
            }
            return `Transfering $${netAmount} from ${fromName} to ${toName}`;
        },
        transferNetAmount(){
            var fromAmt = this.getTotal(this.fromOps);
            var toAmt = this.getTotal(this.toOps);
            var netAmount = fromAmt - toAmt;
            return netAmount;
        },
        bagOptions(){
            var bagOptions = [];
            this.gameState.players.forEach(player => {
                bagOptions.push({type: 'player', bag: player.moneyBag, id: `player-${player.id}`, name: `${player.name} [Player]`, playerId: player.id});
            });
            bagOptions.push({type: 'bank', bag: this.gameState.bankMoneyBag, id: 'bank', name: "BANK"});
            bagOptions.push({type: 'uncle', bag: this.gameState.uncleMoneyBag, id: 'uncle', name: "Uncle Penny Bag's Loose Change"});
            return bagOptions;
        }
    },
    components:{
        OpsEditor
    }
}
</script>
<style>
.my-transfer-display{
    display: flex;
    flex-direction: column;

    padding: 10px;
    margin: 10px;
    border-radius: 4px;
    background-color: rgb(241, 136, 107);    
}
.my-transfer-header select{
    padding: 3px 5px;
    border: 1px solid #aaa;
    border-radius: 3px;
}
.my-transfer-ops{
    display: flex;
}
.my-transfer-ops > * {
    flex: 1;
    
}
.my-transfer-footer{
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.5);
}
.my-center-bigger-font{
    font-size: 1.3em;
    font-style: italic;
}
</style>