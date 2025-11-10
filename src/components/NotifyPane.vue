<template>
    <div class="my-notify-pane" >
        <div class="my-right-notify-stack">
            <div class="my-notify-msg" v-for="(msg, midx) in messages" :key="midx">
                {{ msg.message }} 
            </div>
            [{{ Object.keys(messages).length }}]
        </div>
    </div>
</template>
<script>
import {eventBus} from '@/main.js';

export default{
    props: [],
    data(){
        return {
            messages: {}
        };
    },
    mounted(){
        eventBus.$on('postMessage', this.postMessage);
    },
    methods:{
        postMessage(msgData){
            var duration = msgData.duration || 20000;
            var message = msgData.message || 'No message';
            var id = new Date().getTime() + Math.random() * 100000;
            var msgObj = { id, duration, message };
            this.messages[id] = msgObj;
            console.log(this.messages);
            setTimeout(()=>{
                delete this.messages[msgObj.id];
            }, duration);
        }
    }
}
</script>
<style>
.my-notify-pane{
    position: absolute;
    display: flex;

    top: 0px;
    left:0px;
    width: 100vw;
    height: 100px;
    padding: 0px;
    margin: 0px;
    z-index: 200;
    background-color: rgba(50,0,0,0.2);
}
.my-right-notify-stack{
    width: 0.2vw;
    min-width:100px;
    max-width:180px;
    transition: all 0.5s;

    color: white;
    font-size: 1.1em;
    font-weight: bold;
}
</style>