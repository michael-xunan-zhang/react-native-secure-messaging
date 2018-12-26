import firebase from 'firebase'; // 4.8.1

class Fire {
  messagesRef = null;
  constructor() {
    this.init();
    this.observeAuth();
  }

  // init = () =>
  //   firebase.initializeApp({
  //     apiKey: 'AIzaSyDLgW8QG1qO8O5WZLC1U8WaqCr5-CvEVmo',
  //     authDomain: 'chatter-b85d7.firebaseapp.com',
  //     databaseURL: 'https://chatter-b85d7.firebaseio.com',
  //     projectId: 'chatter-b85d7',
  //     storageBucket: '',
  //     messagingSenderId: '861166145757',
  //   });

  // init = () =>
  //   firebase.initializeApp({
  //     apiKey: "AIzaSyCY0KDCVP6rYDtuijPyZdsT8g1CLXVXvak",
  //     authDomain: "vituity-chating-app.firebaseapp.com",
  //     databaseURL: "https://vituity-chating-app.firebaseio.com",
  //     projectId: "vituity-chating-app",
  //     storageBucket: "vituity-chating-app.appspot.com",
  //     messagingSenderId: "720773461334"
  //   });    

  init = () =>
    firebase.initializeApp({
      apiKey: "AIzaSyBZ5TkD2az52d45wW00DFLYVJDCNUWjWTk",
      authDomain: "test-b1186.firebaseapp.com",
      databaseURL: "https://test-b1186.firebaseio.com",
      projectId: "test-b1186",
      storageBucket: "test-b1186.appspot.com",
      messagingSenderId: "444279045428"
    });    

  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = user => {
    if (!user) {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        alert(message);
      }
    }
  };

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get ref() {
    return firebase.database().ref('messages');
  }

  parse = snapshot => {
    const { timestamp: numberStamp, text, user } = snapshot.val();
    //const { key: _id } = snapshot;
    const { key: uid } = snapshot;
    const timestamp = new Date(numberStamp);
    const message = {
      //_id,
      uid,
      timestamp,
      text,
      user,
    };
    return message;
  };

  on = callback => 
    this.ref
      .limitToLast(20)
      .on('child_added', snapshot => callback(
                                    this.parse(snapshot)            
                                  ));


  on = callback => {
    this.messagesRef = this.ref;
    this.messagesRef.off();
    const onReceive = data => {
      const message = data.val();
      callback({
        //_id: data.key,
        uid: data.key,
        text: message.text,
        createdAt: new Date(message.createdAt),
        //timestamp: new Date(message.createdAt),
        user: {
          //_id: message.user._id,
          _id: message.user.uid,
          name: message.user.name
        }
      });
    };
    this.messagesRef.limitToLast(20).on("child_added", onReceive);
  }

    

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }
  // send the message to the Backend
  send = messages => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user } = messages[i];
      const message = {
        text,
        user,
        timestamp: this.timestamp,
      };
      this.append(message);
    }
  };

  append = message => this.ref.push(message);

  // close the connection to the Backend
  off() {
    this.ref.off();
  }
}

Fire.shared = new Fire();
export default Fire;
