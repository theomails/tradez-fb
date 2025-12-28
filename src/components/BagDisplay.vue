<template>
    <div class="my-bag-holdings">
        <span>💵 </span>
        <span v-for="(num, denom, idx) in bagForView" :key="denom">
            {{ `\$${denom} x ${num}` + separatorCalc(idx) }}
        </span>
        <span class="my-bag-total">  Total: ${{ bagTotal }}</span>
    </div>
</template>
<script>
import money from '@/money.js'

export default{
    props: ["bag"],
    data(){
        return {
            
        };
    },
    methods:{
        separatorCalc(idx){
            return idx<(this.bagDenomsCount-1)?', ':'';
        }
    },
    computed:{
        bagForView(){
            return money.neatViewOfBagFiltered(this.bag);
        },
        bagTotal(){
            var sum = 0;
            Object.keys(this.bagForView).forEach(denom => {
                sum += denom * this.bagForView[denom];
            });
            return sum;
        },
        bagDenomsCount(){
            return Object.keys(this.bagForView).length;
        }
    }
}
</script>
<style>
</style>