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
- Get the app loading and showing up the page
- When someone joins a room, we have to add it to the Room object
- Room users are also players? They personally themselves should get color/icon pick screen.
- Update UI color theme
- Ensure I can only perform actions on my behalf (or, when I'm current player), unless I'm owner
- When notifications array has a new item, it has to be published to all in their own instances.