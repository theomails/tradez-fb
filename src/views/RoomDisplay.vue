<template>
    <div class="app-whole-screen app-pp-page">
        <GameBoard v-if="roomFromDb" :roomObj="roomFromDb" :localUser="localUser" />
    </div>
</template>
<script>
import dbservice from "@/dbservice.js"
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
                    message: 'Joining room..',
                    showClose: false,
                    type:'success'
                });
                let roomObj = await dbservice.getRoomAfterJoining(this.roomId, this.localUser);
                if(roomObj){
                    this.roomFromDb = roomObj;
                    console.log(this.roomFromDb);

                    //Just call again, as anyone could collide with another one when joining
                    this.roomFromDb = await dbservice.getRoomAfterJoining(this.roomId, this.localUser);
                    
                    //Add a listener hook
                    dbservice.listenToRoom(roomObj.roomId, this.onRoomSnapshot);
                }else{
                    this.$notify({
                        message: 'Unable to find a matching room. Please check the link. Redirecting...',
                        showClose: false,
                        type:'error',
                        onClose: ()=>{ this.$router.push({name:'create-room'}); }
                    });
                }
            }else{
                this.$notify({
                    message: 'No room to join. Redirecting..',
                    showClose: false,
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
    background-color: #fee;
    z-index: 1000;
    font-size: 1em;
}
</style>