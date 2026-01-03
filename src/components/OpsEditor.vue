<template>
    <div class="my-ops-editor">
        <span><b>{{ bagWrapper?.name }} gives: </b></span>
        <div class="my-ops-denom-row" v-for="(count, denom) in neatOps" :key="denom">
            ${{ denom }} x <div class="my-op-edit-item"> 
                <button class="btn-left" @click="onDecrClick(denom)">-</button>
                <span class="count">{{ count }}</span>
                <button class="btn-right" @click="onIncrClick(denom)">+</button>
            </div> = ${{ denom * count }}
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

            this.$emit('decrement', {denom});
        },
        onIncrClick(denom){
            var notes = this.bagWrapper.bag[denom] || 0;
            var nowCount = this.neatOps[denom] || 0;
            if(nowCount >= notes) return; //Can't exceed

            this.$emit('increment', {denom});
        }
    }
}
</script>
<style>
.my-ops-editor{
    padding: 10px 20px 20px 20px;
    margin: 10px 0px;
    margin-bottom: 1px;
    background-color: rgba(255, 255, 255, 0.5);    
}
.my-ops-denom-row{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.my-op-edit-item{
    display: inline;
}
.my-op-edit-item > button{
    margin: 3px 5px;
    padding: 3px 5px;
    box-shadow: none;
}
.my-op-edit-item button.btn-left{
    margin-right: 0px;
    border: 1px solid lightgray;
    border-radius: 0px;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
}
.my-op-edit-item button.btn-right{
    margin-left: 0px;
    border: 1px solid lightgray;
    border-radius: 0px;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
}
.my-op-edit-item span.count{
    padding: 3px 10px;
    background-color: rgba(255, 255, 255, 0.5);
    border-top: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
}
</style>