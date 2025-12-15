<template>
    <div class="app-card">
        <div class="app-card-header">
            Create Room
        </div>
        <div class="app-card-body">
            <form id="create-poker-room" class="app-form">
                <div class="app-form-row app-info-bubble">
                    <p>If you want to create a Room and invite others, you can create one below.</p>
                    <p><em>If you want to <b>join</b> someone else's Room, please ask them for the join-room link.</em></p>
                </div>
                <div class="app-form-row">
                    <label>Your name (Room owner)</label>
                    <input type="text" name="ownerName" disabled :value="userName"/>
                </div>
                <div class="app-form-row">
                    <label>Game Room name</label>
                    <input ref="teamName" key="teamName" type="text" name="teamName" 
                        v-model="teamName" disabled/>
                </div>
                <div class="app-form-row">
                    <button ref="createButton" @click.prevent="createRoom" :disabled="!goodToCreateRoom">
                        <el-icon><CirclePlusFilled /></el-icon>
                        <span>Create Room!</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
<script>
import dbservice from '@/dbservice.js'
import backendhelper from '@/backendhelper.js'

export default {
    data(){
        return {
            userName:""
        };
    },
    methods:{
        async createRoom(){
            try{
                //Create Room
                this.$notify({
                        message: 'Creating Room..',
                        showClose: false,
                        type:'success'
                    });
                
                this.$Progress.start();
                let roomId = await backendhelper.createRoomGetId();
                
                this.$Progress.finish();

                //Redirect
                this.$router.push({name:'room', params:{ roomId }});
            } catch (err){
                console.log(err);
            }
        }
    },
    computed:{
        goodToCreateRoom(){
            return this.teamName && (this.teamName.length >= 4);
        },
        teamName(){
            return `${this.userName}'s Room`;
        }
    },
    mounted(){
        this.userName = dbservice.getAndSyncLocalUser()?.userName;
        if(!this.userName){
            this.$router.push( {name:'login'} );
        }else{
            this.$nextTick( ()=> this.$refs.createButton.focus() );
        }
    }
}
</script>
<style scoped>
div, h1, h2, h3, h4{
    font-size: 1.1em;
}
.app-card-header {
    font-size: 12pt;
}
</style>