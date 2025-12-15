import axios from "axios";
//import { getAuth } from "firebase/auth";

export async function callFnWithAuth(fnName, data) {
  console.log('fnName: ' + fnName);

  let url;
  if(fnName == 'processGameCommand'){
    url = process.env.VUE_APP_FN_URL_PROCESS_GAME_COMMAND;
  } else if(fnName == 'addUserToRoom'){
    url = process.env.VUE_APP_FN_URL_ADD_USER_TO_ROOM;
  } else if(fnName == 'createRoomByOwner'){
    url = process.env.VUE_APP_FN_URL_CREATE_ROOM_BY_OWNER;
  }

  //const user = getAuth().currentUser;
  //const token = user ? await user.getIdToken() : null;
  console.log('Fn Url: ' + url);
  const resp = await axios.post(url, data, {
    //headers: token ? { Authorization: `Bearer ${token}` } : {},
    headers: { "Content-Type": "application/json" },
    timeout: 10000
  });

  return resp.data;
}