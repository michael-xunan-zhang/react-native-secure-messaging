import React, { Component, PropTypes } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableHighlight, 
  Button, 
  Image,
  AppState,
  Linking
} from "react-native";

import { GiftedChat, GiftedAvatar, Bubble } from "react-native-gifted-chat";

import firebase from "firebase";
import _ from "lodash";


var name, uid, email, users, threadChatRoomID, threadChatName, currUserUid;

class ThreadChatRoom extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
      messages: []
     };

    const { params } = this.props.navigation.state;
    uid = params.uid;
    name = params.name;
    email = params.email;
    users = params.users;
    threadChatRoomID = params.threadChatRoomID;
    threadChatName = params.threadChatName;

    this.thread = firebase.database().ref("threads/" + params.threadChatRoomID);
    this.threadSorted = this.thread.orderByChild("order");
    this.threadRef = firebase.database().ref("threadsRef/latestMessages/" 
                                            + params.threadChatRoomID)
    


    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        currUserUid = user.uid;  
      }
      else {
        console.log("no user....?")
      }
    });
  }

    static navigationOptions = ({ navigation }) => ({
    title: "ThreadChatRoom"
    //title: (navigation.state.params || {}).name || 'Chat!',
    //title: this.props.navigation.state.params.name
  });




  sendMessage(messages = []) {
    messages.forEach(message => {
      var now = new Date().getTime();
      this.thread.push({
        _id: now,
        text: message.text,
        createdAt: now,
        uid: currUserUid,
        order: -1 * now,
        name: name,
        user: {
            _id: currUserUid,
            name: name
        },
        users: users,
        messageType: "text",
        image: ""
      });
      this.threadRef.set({
        _id: now,
        text: message.text,
        createdAt: now,
        uid: currUserUid,
        order: -1 * now,
        name: name,
        user: {
            _id: currUserUid,
            name: name
        },
        users: users,
        messageType: "text",
        image: ""
      })
    });
  }
  
  //edit this function!
  listenForItems(chatRef) {
    console.log("listen For Items.....................")
    chatRef.on("value", snap => {
      // get children as an array
      var items = [];
      snap.forEach(child => {
        //var name = child.val().uid == this.user.uid ? this.user.name : name1;
        items.push({
          _id: child.val().createdAt,
          text: child.val().text,
          createdAt: new Date(child.val().createdAt),
          uid: currUserUid,
          fuid: uid,
          user: {
            _id: child.val().uid,
            name: child.val().name,
            //avatar: "https://placeimg.com/140/140/any"
          }
        });
      });

      this.setState({
        loading: false,
        messages: items
      });
    });
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
    console.log("GloChat component will unmount")
    this.threadSorted.off();
    Linking.removeEventListener('url', this.handleOpenURL)
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  componentDidMount() {
    console.log("Thread Chat Room component did mount???")
    console.log(this.props.navigation.state)

    AppState.addEventListener('change', this.handleAppStateChange);

    Linking.getInitialURL().then((ev) => {
      console.log(ev)
      if (ev != null) {
        this.handleOpenURL(ev);
      }
    }).catch(err => {
        console.warn('An error occurred', err);
    });


    this.listenForItems(this.threadSorted)
  }


  render() {
    return (
        <View style={styles.container}>              

            <Text style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "bold"
            }}>
            {threadChatName}
            </Text>

        <TouchableHighlight 
                style ={{
                    height: 40,
                    width: 60,
                    //borderRadius:10,
                    backgroundColor : "white",
                    marginLeft : 0,
                    //marginRight:50,
                    marginTop :20
                }}>
            <Button 
            onPress={() => {
                this.props.navigation.navigate("SignedIn")
            }}        
            title="<Back"
            //accessibilityLabel="Learn more about this button"
            /> 
        </TouchableHighlight> 

        <GiftedChat
        messages={this.state.messages}
        onSend={this.sendMessage.bind(this)}
        user={{
            _id: currUserUid,
            name: name
        }}
        />
        </View>

    );
  }
}


const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "white"
//   },
  container: {
    flex: 1,
    alignItems: "stretch",
    marginRight: 10,
    marginLeft: 10,
    marginTop: 40
  },
  name: {
    textAlignVertical: "center",
    color: "grey"
  }
});
export default ThreadChatRoom;