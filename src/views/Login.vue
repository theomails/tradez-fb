<template>
    <div class="app-card">
        <div class="app-card-header">
            Welcome to Tradez!
        </div>
        <div class="app-card-body">
            <form id="create-poker-room" class="app-form">
                <div class="app-form-row">
                    <label>Type your name below to login </label>
                    <input ref="userName" key="userName" type="text" name="userName" v-model="userName" 
                        @keydown.enter.prevent="login" 
                        :class="{'app-input-error':!goodToLogin}"/>
                </div>
                <div class="app-form-row">
                    <button @click.prevent.stop="login" :disabled="!goodToLogin">
                        <el-icon><Unlock /></el-icon>
                        <span v-html="nameIsEmpty ? 'Login' : 'Login as <b>' + userName + '</b>'"></span>
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
            forwardToRoomId: null
        };
    },
    methods:{
        login(){
            //Login
            this.$notify({
                    message: 'Logging in..',
                    showClose: false,
                    type:'success'
                });
            dbservice.createLocalUser(this.userName);

            //Redirect
            if(this.forwardToRoomId){
                this.$router.push({name:'room', params:{roomId: this.forwardToRoomId }});
            }else{
                this.$router.push({name:'create-room'});
            }
        }
    },
    computed:{
        goodToLogin(){
            return this.userName && (this.userName.length >= 3);
        },
        nameIsEmpty(){
            return !this.userName || (this.userName.length == 0);
        }
    },
    mounted(){
        let urlParams = new URLSearchParams(window.location.search);
        this.forwardToRoomId = urlParams.get('forwardToRoomId');

        this.$refs.userName.focus();
    }
}
</script>