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
                    <input type="text" disabled :value="userName"/>
                </div>
                <div class="app-form-row">
                    <label>Team name</label>
                    <input ref="teamName" key="teamName" type="text" name="teamName" v-model="teamName" 
                        @keydown.enter.prevent="createRoom"
                        :class="{'app-input-error':!goodToCreateRoom}"
                    />
                </div>
                <div class="app-form-row">
                    <button @click.prevent="createRoom" :disabled="!goodToCreateRoom">
                        <el-icon><CirclePlusFilled /></el-icon>
                        <span>Create Room</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
<script>
import dbservice from '@/dbservice.js'

export default {
    data(){
        return {
            userName:"",
            teamName: ""
        };
    },
    methods:{
        async createRoom(){
            //Create Room
            this.$notify({
                    message: 'Creating Room..',
                    showClose: false,
                    type:'success'
                });
            
            this.$Progress.start();
            let room = await dbservice.createRoom(this.teamName);
            this.$Progress.finish();

            //Redirect
            this.$router.push({name:'room', params:{roomId: room.roomId }});
        }
    },
    computed:{
        goodToCreateRoom(){
            return this.teamName && (this.teamName.length >= 4);
        }
    },
    mounted(){
        this.userName = dbservice.getLocalUser()?.userName;
        if(!this.userName){
            this.$router.push( {name:'login'} );
        }else{
            this.$nextTick( ()=> this.$refs.teamName.focus() );
        }
    }
}
</script>