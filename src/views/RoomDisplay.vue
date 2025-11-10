<template>
    <div class="app-card app-card-wide app-pp-page">
        <game-board/>
    </div>
</template>
<script>
import dbservice from "@/dbservice.js"
import GameBoard from "../components/GameBoard.vue";

export default{
    props: ["roomId"],
    data(){
        return {
            user: null,
            room: null
        }
    },
    methods:{
        async onStartGame(currentStory){
            //Async-FF
            this.$Progress.start();
            this.room = await dbservice.startGameInRoom(this.room, currentStory);
            this.$Progress.finish();
        },
        async onActionClicked(action){
            if(action=='REVEAL'){
                this.$notify({
                    message: 'Revealing..',
                    showClose: false,
                    type:'success'
                });
                //Async-FF
                this.$Progress.start();
                this.room = await dbservice.revealWithSummaryGameInRoom(this.room);
                this.$Progress.finish();
            }else if(action=='START_NEW'){
                this.$notify({
                    message: 'Starting new game..',
                    showClose: false,
                    type:'success'
                });
                //Async-FF
                this.$Progress.start();
                this.room = await dbservice.startSetupGameInRoom(this.room);
                this.$Progress.finish();
            }
        },
        async onCardSelected(pcard){
            console.log("selectPoint(pcard)");
            //Async-FF
            this.$Progress.start();
            this.room = await dbservice.selectDeselectCardForCurrentUserGameInRoom(this.room, this.user, pcard);
            this.$Progress.finish();
        },
        isThisSelectedByCurrentUser(pcard){
            return this.user && (pcard==this.room.currentStorySelectedCards[this.user.userId]);
        },
        async checkAndLoadRoom(){
            //If roomId is passed as input (path parameter becomes prop), get room details into data
            if(this.roomId){
                this.$notify({
                    message: 'Joining room..',
                    showClose: false,
                    type:'success'
                });
                let roomObj = await dbservice.getRoomAfterJoining(this.roomId, this.user);
                if(roomObj){
                    this.room = roomObj;
                    console.log(this.room);

                    //Just call again, as anyone could collide with another one when joining
                    this.room = await dbservice.getRoomAfterJoining(this.roomId, this.user);
                    
                    //Add a listener hook
                    dbservice.listenToRoom(roomObj, this.onRoomChange);
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
        onRoomChange(newRoomObj){
            this.room = newRoomObj;
        }
    },
    watch:{
        roomId(){
            //Async-FF
            this.checkAndLoadRoom();
        }
    },
    computed:{
        iHaveMadeASelection(){
            if(this.user && this.room.currentStorySelectedCards[this.user.userId]) return true;
            else return false;
        },
        roomCurrentStoryName(){
            return this.room.currentStoryName?this.room.currentStoryName:'untitled';
        }
    },
    async mounted(){
        //Check user exists, or go to login
        this.userName = dbservice.getLocalUser()?.userName;
        if(!this.userName){
            this.$router.push( {name:'login', query:{forwardToRoomId:this.roomId}} );
            return;
        }else{
            this.user = dbservice.getLocalUser();
        }
        //Async-Wait
        this.$Progress.start();
        await this.checkAndLoadRoom();
        this.$Progress.finish();
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

</style>