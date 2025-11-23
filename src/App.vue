<template>
  <div id="app">
    <vue-progress-bar></vue-progress-bar>
    <div class="app-header">
      <div class="app-header-logo" @click="logoClick">
        <el-icon ><ChatDotSquare /></el-icon>
        <!--img src="/favicon.ico" style="height:48px;"/-->
        <h4>Tradez!</h4>
      </div>
      <div class="app-flex-spacer"></div>
      <div class="app-header-profile-wrapper">
        <div class="app-header-profile" v-if="localUser?.userName">
          <span class="app-profile-name"> {{ localUser.userName }} </span>
          <a class="app-profile-edit" href="#" @click.prevent="onUserEditClick"><el-icon><EditPen /></el-icon></a> 
        </div>
      </div>
    </div>

    <div class="app-body">
      <router-view />
    </div>
  </div>
</template>
<script>
import dbservice from '@/dbservice'

export default {
  name: 'App',
  data(){
    return {
      localUser: null
    };
  },
  methods:{
    logoClick(){
      this.$router.push( '/' );
    },
    onUserEditClick(){
      this.$router.push( {name:'login'} );
    },
    checkUserChange(){
      this.localUser = dbservice.getAndSyncLocalUser();
    }
  },
  watch:{
    $route(){
      this.checkUserChange();
    }
  },
  mounted(){
    this.checkUserChange();
  },
  components: {
  }
}
</script>
<style>
  @import './assets/app.css';
</style>
<style>
.app-header{
  padding: 30px 30px 15px 30px;
  display: flex;
  align-items: center;
  z-index: 10;
}
.app-flex-spacer{
  flex-grow: 1;
}
.app-header-logo{
  display: inline-flex;
  align-items: baseline;
  cursor: pointer;

  padding: 7px 15px 9px 15px;
  border-radius: 5px;
  /* box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px; */

  font-size: 15pt;
  font-weight: 600;
  /* background-color: white; */
}
.app-header-logo > h4{
  margin:10px;  
}
.app-header-logo i{
  font-size: 20pt; 
  position: relative; 
  top: 6px;
  margin: 0px 5px;
}
.app-header-profile{
  padding: 10px;  
  display: flex;
  align-items: center;

}
.app-profile-edit{
  vertical-align: middle;
  display: flex;
  align-items: center;
}
.app-profile-name{
  font-size: 1.1em;
  font-weight: bold;
}
.app-header-profile i{
  color: #666;
  text-decoration: none;
  top:0;
  padding: 5px;
  margin: 0px 5px;
  height: calc(1em + 10px);
  width: calc(1em + 10px);
}

html, body{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-image: linear-gradient(-22deg, rgb(247, 167, 143), rgb(253, 235, 130));
  margin: 0;
  padding: 0;
  font-size: 0.8em;
}
.my-game-board button{
  background-color: white;
  border: 0px solid #bbb;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 10px;
  cursor: pointer;
  padding: 5px 10px;
}
.my-game-board button:disabled{
  color: #ddd;
}
.func-flex-grow{
    flex: 1;
}
</style>