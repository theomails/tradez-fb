<template>
    <div class="my-bag-holdings">
        <span v-for="(num, denom) in bagForView" :key="denom">
            {{ `[\$${denom} x ${num}] ` }}
        </span>
        <span> :: Total: ${{ bagTotal }}</span>
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
    computed:{
        bagForView(){
            return money.neatViewOfBag(this.bag);
        },
        bagTotal(){
            var sum = 0;
            Object.keys(this.bagForView).forEach(denom => {
                sum += denom * this.bagForView[denom];
            });
            return sum;
        }
    }
}
</script>
<style>

</style>