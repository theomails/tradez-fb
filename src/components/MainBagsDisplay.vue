<template>
    <div class="my-main-bags">
        <div class="my-main-bag my-main-bag-1">
            <span>Bank's moneys</span>
            <BagDisplay :bag="bankBagForView" :gameState="gameState"></BagDisplay>            
        </div>
        <div class="my-main-bag">
            <span>Uncle Penny Bag's Loose Change</span>
            <BagDisplay :bag="uncleBagForView" :gameState="gameState"></BagDisplay>
        </div>
    </div>
</template>
<script>
import money from '@/money.js'
import BagDisplay from './BagDisplay.vue';

export default{
    props: ["gameState"],
    data(){
        return {
            
        };
    },
    computed:{
        bankBagForView(){
            return money.neatViewOfBag(this.gameState.bankMoneyBag);
        },
        uncleBagForView(){
            return money.neatViewOfBag(this.gameState.uncleMoneyBag);
        }
    },
    components:{
        BagDisplay
    }
}
</script>
<style>
.my-main-bag{
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.35);
}
.my-main-bags{
    padding: 5px 10px;
    margin: 10px;
    border-radius: 4px;
    background-color: rgb(241, 136, 107);    
}
.my-main-bag-1{
    margin-bottom: 1px;
}
</style>