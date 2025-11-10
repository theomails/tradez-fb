<template>
    <div class="my-ops-editor">
        <span><b>{{ bagWrapper?.name }} gives: </b></span>
        <div class="my-ops-denom-row" v-for="(count, denom) in neatOps" :key="denom">
            ${{ denom }} x <span class="my-op-edit-item"> 
                <button @click="onDecrClick(denom)">-</button> {{ count }} <button @click="onIncrClick(denom)">+</button> </span> = ${{ denom * count }}
        </div>
    </div>
</template>
<script>
export default {
    props: ['bagWrapper', 'neatOps'],
    data(){
        return {};
    },
    methods:{
        onDecrClick(denom){
            var nowCount = this.neatOps[denom] || 0;
            if(nowCount <= 0) return; //Can't go below 0

            this.$emit('decrement', denom);
        },
        onIncrClick(denom){
            var notes = this.bagWrapper.bag[denom] || 0;
            var nowCount = this.neatOps[denom] || 0;
            if(nowCount >= notes) return; //Can't exceed

            this.$emit('increment', denom);
        }
    }
}
</script>
<style>
.my-ops-editor{
    padding: 10px 20px 20px 20px;
    margin: 10px 0px;
    background-color: rgba(255, 255, 255, 0.35);    
}
.my-op-edit-item{
    margin: 0px 10px;
}
.my-op-edit-item > button{
    margin: 3px 10px;
    padding: 3px 20px;
}
</style>