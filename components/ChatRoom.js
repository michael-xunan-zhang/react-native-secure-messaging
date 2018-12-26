import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  ListView,
  Image,
  Button,
  TextInput,
  AppState,
  Linking
} from "react-native";
// import { Container, 
//   Content, Header, Left, Right, 
//   Body, Title, Card, CardItem } from 'native-base';
import { Header, Icon } from "react-native-elements";
import { StackNavigator, NavigationActions } from "react-navigation";
import { GiftedChat } from "react-native-gifted-chat";
import firebase from "firebase";
import NavigationBar from "react-native-navbar";
//import ImagePicker from "react-native-image-picker";
//import RNFetchBlob from 'react-native-fetch-blob';
//import NavigationService from 'path-to-NavigationService.js';


//chat user info
var name, uid, email, currUserUid, chatRef;
//current user
var currUser = null;


class ChatRoom extends React.Component {


  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      currentUserUid: ''
    };
    
    const { params } = this.props.navigation.state;
    uid = params.uid;
    name = params.name;
    email = params.email;
    currUserName = params.currUserName;
    currUserEmail = params.currUserEmail;
    currUserUid = params.currUserUid;
    text = params.text;

    this.chatRef = this.createChatRoom();

    this.chatRefData = this.chatRef.orderByChild("order");

    //new
    this.latestMessageRef = this.createChatRoomRef();
    
    this.onSend = this.onSend.bind(this);
  }

  static navigationOptions = {
    title: 'Welcome to the app!',
  };

  helper =() => {
    this.props.navigation.navigate("UserList")
  }

  createChatRoom() {
    if (currUserUid > uid) {
      console.log(currUserUid + " > " + uid)
      return firebase.database().ref("chatRoom/"+currUserUid+"-"+uid)
    } else {
      console.log(uid + " > "+ currUserUid)
      return firebase.database().ref("chatRoom/"+uid+"-"+currUserUid)
    }
  }

  createChatRoomRef() {
    if (currUserUid > uid) {
      console.log(currUserUid + " > " + uid)
      return firebase.database().ref("chatRoomRef/"+currUserUid+"-"+uid)
    } else {
      console.log(uid + " > "+ currUserUid)
      return firebase.database().ref("chatRoomRef/"+uid+"-"+currUserUid)
    }
  }


//version 3
  listenForItems(chatRef) {
    chatRef.on("value", snap => {
      // get children as an array
      var items = [];
      snap.forEach(child => {

        if (child.val().uid == currUserUid && child.val().fuid == uid) {
          console.log("pushing a uid message")
          items.push({
            _id: child.val().createdAt,
            text: child.val().text,
            createdAt: new Date(child.val().createdAt),
            user: {
              _id: child.val().uid
              //avatar: avatar
            },
            messageType: child.val().messageType,
            image: child.val().messageType == "image" ? child.val().image: ""
          });
        } 
        else if (child.val().uid == uid && child.val().fuid == currUserUid) {
          console.log("pushing a fuid message")
          items.push({
            _id: child.val().createdAt,
            text: child.val().text,
            createdAt: new Date(child.val().createdAt),
            user: {
              _id: child.val().uid
              //avatar: avatar
            },
            messageType: child.val().messageType,
            image: child.val().messageType == "image" ? child.val().image: ""
          });
        }
        else {
          console.log("not pushing this message")
          items.push({
            _id: child.val().createdAt,
            text: child.val().text,
            createdAt: new Date(child.val().createdAt),
            user: {
              _id: child.val().uid
              //avatar: avatar
            },
            messageType: child.val().messageType,
            image: child.val().messageType == "image" ? child.val().image: ""
          });
        }
      });

      this.setState({
        messages: items
      });
    });
  }


  set_params(name, email, uid) {
    console.log("setting params......")
    const setParamsAction = NavigationActions.setParams({
      params: { name: name, email: email, uid: uid },
      key: "Home"
    })
    this.props.navigation.dispatch(setParamsAction)
  }

  handleOpenURL = (event) => {
    console.log("handleOpenUrl??????")
    this.props.navigation.navigate("CreateNewMessage", {
      url: event.url
    })
  }

  handleAppStateChange = (nextAppState) => {
    console.log("handle app state change???")
    Linking.addEventListener('url', this.handleOpenURL);
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL)
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  componentDidMount() {
    console.log("component did mount???")

    AppState.addEventListener('change', this.handleAppStateChange);

    Linking.getInitialURL().then((ev) => {
      console.log(ev)
      if (ev != null) {
        this.handleOpenURL(ev);
      }
    }).catch(err => {
        console.warn('An error occurred', err);
    });
    if (text != undefined) {
      this.sendMessage(text)
    }
    this.listenForItems(this.chatRefData);
    this.set_params(currUserName, currUserEmail, currUserUid);
  }

  componentWillUnmount() {
    this.chatRefData.off();
  }

  sendMessage(text) {
    console.log("sendMessage.....???")
    now = new Date().getTime();
    this.chatRef.push({
      _id: now,
      text: text,
      createdAt: now,
      uid: currUserUid,
      fuid: uid,
      order: -1 * now,
      messageType: "text",
      image: ""
    });

    this.latestMessageRef.set({
      _id: now,
      text: text,
      createdAt: now,
      order: -1 * now,
      name: name,
      email: email,
      uid: uid,
      currUserName: currUserName,
      currUserUid: currUserUid,
      currUserEmail: currUserEmail,

      messageType: "text",
      image: ""
    });    
  }

  onSend(messages = []) {
    console.log("onSend.....")
    messages.forEach(message => {
      var now = new Date().getTime();
      this.chatRef.push({
        _id: now,
        text: message.text,
        createdAt: now,
        //uid: this.user.uid,
        uid: currUserUid,
        fuid: uid,
        order: -1 * now,
        //do not need to add name here cuz it's in individual chat room
        // name: name
        messageType: "text",
        image: ""
      });
      //now, set chatRoomRef:
      this.latestMessageRef.set({
        _id: now,
        text: message.text,
        createdAt: now,
        order: -1 * now,

        name: name,
        email: email,
        uid: uid,
        currUserName: currUserName,
        currUserUid: currUserUid,
        currUserEmail: currUserEmail,
        messageType: "text",
        image: ""
      });
    });
  }

  //Reference here:
  //http://nobrok.com/how-to-upload-image-to-firebase-using-react-native/

  // handleAddPicture = () => {
  //   //const { user } = this.props; // wherever you user data is stored;
  //   const options = {
  //       title: "Send a Photo:",
  //       // mediaType: "photo",
  //       takePhotoButtonTitle: 'Use Camera',
  //       chooseFromLibraryButtonTitle: 'Chose Photo from Library',
  //       // maxWidth: 256,
  //       // maxHeight: 256,
  //       // allowsEditing: true,
  //       // noData: true
  //   };
  //   ImagePicker.showImagePicker(options, (response) => {
  //       console.log("Response = ", response);
  //       if (response.didCancel) {
  //           // do nothing
  //       } else if (response.error) {
  //           // alert error
  //       } else {

  //         //try sth here:
  //         console.log(response.origURL)
  //         image = response.origURL

  //         const Blob = RNFetchBlob.polyfill.Blob
  //         const fs = RNFetchBlob.fs
  //         window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
  //         window.Blob = Blob

  //         let uploadBlob = null
  //         const imageRef = firebase.storage().ref('posts').child("test.jpg")
  //         let mime = 'image/jpg'
  //         fs.readFile(image, 'base64')
  //           .then((data) => {
  //             return Blob.build(data, { type: `${mime};BASE64` })
  //         })
  //         .then((blob) => {
  //             uploadBlob = blob
  //             return imageRef.put(blob, { contentType: mime })
  //           })
  //           .then(() => {
  //             uploadBlob.close()
  //             return imageRef.getDownloadURL()
  //           })
  //           .then((url) => {
  //             // URL of the image uploaded on Firebase storage
  //             console.log(url);
  //         now = new Date().getTime();
  //         console.log(now)
  //         this.chatRef.push({
  //           _id: now,
  //           text: "",
  //           createdAt: now,
  //           //uid: this.user.uid,
  //           uid: currUserUid,
  //           fuid: uid,
  //           order: -1 * now,
  //           //do not need to add name here cuz it's in individual chat room
  //           // name: name
  //           messageType: "image",
  //           image: url
  //         });

  //         this.latestMessageRef.set({
  //           _id: now,
  //           text: "",
  //           createdAt: now,
  //           order: -1 * now,
    
  //           name: name,
  //           email: email,
  //           uid: uid,
  //           currUserName: currUserName,
  //           currUserUid: currUserUid,
  //           currUserEmail: currUserEmail,

  //           messageType: "image",
  //           image: url
  //         });
          
  //           })
  //           .catch((error) => {
  //             console.log(error);
  //         })  

  //       }
  //   });
  // };


  render() {
    // const rightButtonConfig = {
    //   title: 'Add photo',
    //   handler: () => this.handleAddPicture(),
    // };
    const leftButtonConfig = {
      title: '<Back',
      handler: () => {this.props.navigation.navigate("SignedIn")},
    };
    return (
      <View style={styles.container}>              

        <NavigationBar
          title={{ title: name }}
          leftButton={leftButtonConfig}
          // ****IMPORTANT******disable the send picture function for now...
          // rightButton= {
          // <TouchableHighlight
          //   onPress={() => {
          //     this.handleAddPicture()
          //   }}
          // >
          // <Image
          // style={{width: 30, height: 30}}
          // source={require("../images/camera.png")}
          // />
          // </TouchableHighlight>
          // }
        />
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend.bind(this)}
          user={{
            _id: currUserUid
          }}
        />
      </View>
    // {/* </View> */}
    ); 
  }


}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "stretch",
      marginRight: 10,
      marginLeft: 10,
      marginTop: 40
    },
    chat: {
      flex: 1
    },
    button: {
      flex: 1,
      marginLeft: 200,
      color: "red"
    }
  });

  export default ChatRoom;
