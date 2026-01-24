<template>
    <div class="app-whole-screen app-pp-page">
        <GameBoard v-if="roomFromDb" :roomObj="roomFromDb" :localUser="localUser" />
    </div>
</template>
<script>
import dbservice from "@/dbservice.js"
import backendhelper from "@/backendhelper.js"
import GameBoard from "../components/GameBoard.vue";

export default{
    props: ["roomId"],
    data(){
        return {
            roomFromDb: null,
            localUser: null
        }
    },
    methods:{
        async checkAndLoadRoom(){
            //If roomId is passed as input (path parameter becomes prop), get room details into data
            if(this.roomId){
                this.$notify({
                    text: 'Joining room..',
                    type:'success'
                });
                try{
                    await backendhelper.initiateJoinRoom(this.roomId, this.localUser);
                    dbservice.listenToRoom(this.roomId, this.onRoomSnapshot);
                } catch (err) {
                    this.$notify({
                        text: 'Unable to find a matching room. Please check the link. Redirecting...',
                        type:'error'
                    });             
                    setTimeout(()=>{ this.$router.push({name:'create-room'}); }, 5000);
                }
            }else{
                this.$notify({
                    text: 'No room to join. Redirecting..',
                    type:'success'
                });
                this.$router.push({name:'create-room'});
            }            
        },
        onRoomSnapshot(newRoomObj){
            console.log('Got new snapshot..');
            console.log(newRoomObj);
            this.roomFromDb = newRoomObj;
        }
    },
    watch:{
        async roomId(){
            //Async-Wait
            this.$Progress.start();
            await this.checkAndLoadRoom();
            this.$Progress.finish();
        }
    },
    async mounted(){
        //Check user exists, or go to login
        this.localUser = await dbservice.getAndSyncLocalUser();
        let userName = this.localUser?.userName;
        if(!userName){
            this.$router.push( {name:'login', query:{forwardToRoomId:this.roomId}} );
            return;
        }

        try{
            //Async-Wait
            this.$Progress.start();
            await this.checkAndLoadRoom();
            this.$Progress.finish();
        } catch (err) {
            console.log(err);
        }
    },
    components:{
        GameBoard
    }
}
</script>
<style>
.app-pp-page{
    user-select: none;
}
.app-whole-screen{
    position: absolute;
    top: 0;
    left:0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(247, 232, 205, 0.6);
    z-index: 50;
    font-size: 1em;
}
</style>