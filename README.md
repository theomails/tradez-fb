# tradez-fb
Trade game multiplayer edition with online rooms.

This project goes with Firebase CLI. So, you may have to `firebase init`, etc. to get the DB connected.
Also, `npm run build` and then `firebase deploy` to deploy to prod.

Hints:
  - Use `set NODE_OPTIONS=--openssl-legacy-provider && ` in package.json or `export NODE_OPTIONS=--openssl-legacy-provider` in terminal in case of SSL/certificate issues.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### TODO
- Room users are also players? They personally themselves should get color/icon pick screen. P1
- Ensure I can only perform actions on my behalf (or, when I'm current player), unless I'm owner KEEP
- People should have option to click and share current game room link P1
- Room owner may be allowed to unlock after a period of time. P2
- Notification toast is not working. P2
- Internet issue is not showing notification of error. P2
- Reset booths by Room Owner
- Messages and chat, with BUZZ keyword.
- Instructions panel.
- Animations