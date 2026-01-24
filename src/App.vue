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
      <Notifications :duration="3000"/>
      <router-view />
    </div>
  </div>
</template>
<script>
import dbservice from '@/dbservice'
import { Notifications } from '@kyvg/vue3-notification'

export default {
  name: 'App',
  data(){
    return {
      localUser: null,
      rainbowBorderNum: 0
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
    },
    applyNextRainbowColor() {
      const MAX = 8;
      const nodes = document.querySelectorAll('.rainbow-border');

      nodes.forEach(el => {
        // remove any existing rainbow-border-* class
        el.classList.forEach(cls => {
          if (cls.startsWith('rainbow-border-')) {
            el.classList.remove(cls);
          }
        });

        // add next border class
        this.rainbowBorderNum = (this.rainbowBorderNum % MAX) + 1;
        el.classList.add(`rainbow-border-${this.rainbowBorderNum}`);
      });
    },
    tickForRainbowBorder() {
      this.applyNextRainbowColor();
      setTimeout(this.tickForRainbowBorder, 1500);
    }
  },
  watch:{
    $route(){
      this.checkUserChange();
    }
  },
  mounted(){
    this.checkUserChange();
    this.tickForRainbowBorder();
  },
  components: {
    Notifications
  }
}
</script>
<style>
  @import './assets/app.css';
</style>
<style scoped>
span {
  font-size: 11pt;
}
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
  background-image: linear-gradient(-22deg, rgb(247, 167, 143), rgb(253, 235, 130));
}
*, *:before, *:after {
  box-sizing: inherit;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  font-size: 0.8em;
}
.my-transfer-dropdown {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 0.8em;
}
.my-transfer-dropdown * {
  font-size: 12px;
}

.my-game-board button{
  opacity: 0.9;
  background-color: white;
  border: 0px solid #bbb;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 2px;
  border-radius: 6px;
  cursor: pointer;
  padding: 5px 10px;
}
.my-game-board button:disabled{
  color: #ddd;
}
.my-game-board button:hover{
  opacity: 1;
}
.func-flex-grow{
    flex: 1;
}
input:disabled {
  color: #666;
}

.vue-notification {
  border-left: 5px solid #e7a518;
  background-color: #f0c467;
  font-size: 1.3em;
  padding: 15px;
}
#app .vue-notification-group {
  margin-top: 20px;
  margin-right: 20px;
  z-index: 290;
}
#app .rainbow-border {
  border: 3px solid #d4af37; /* classic gold */
  transition: border-color 750ms linear;
}
#app .rainbow-border-1 {
  border-color: #c46a63; /* muted rose red */
}
#app .rainbow-border-2 {
  border-color: #c9824a; /* deep peach / amber */
}
#app .rainbow-border-3 {
  border-color: #c9b25c; /* dark warm yellow */
}
#app .rainbow-border-4 {
  border-color: #7fa982; /* muted green */
}
#app .rainbow-border-5 {
  border-color: #5fa3a0; /* deep teal-mint */
}
#app .rainbow-border-6 {
  border-color: #6f8fb8; /* dusty blue (not pure blue) */
}
#app .rainbow-border-7 {
  border-color: #8b79b8; /* muted violet */
}
#app .rainbow-border-8 {
  border-color: #b07a9e; /* dusty magenta */
}

</style>