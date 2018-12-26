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


var name, uid, email, users, groupChatRoomID, groupChatName, currUserUid;

class GloChat extends React.Component {
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
    groupChatRoomID = params.groupChatRoomID;
    groupChatName = params.groupChatName;
    this.messagesRef = null;
    this.messagesRefData = null;
    this.latestMessagesRef = null;
    if (groupChatRoomID != "") {
        console.log("groupChatRoomID is empty")
        this.messagesRef = firebase.database().ref("groupChatRooms/"+groupChatRoomID)
        this.messagesRefData = this.messagesRef.orderByChild("order");
        this.latestMessagesRef = firebase.database().ref("groupChatRoomsRef/latestMessages/"+groupChatRoomID)
    } else {
      console.log("groupChatRoomID is not empty")
      //this.messagesRef = this.createGroupChatRoom();
      id = this.createGroupChatRoom()
      this.messagesRef = firebase.database().ref("groupChatRooms/"+id)
      this.messagesRefData = this.messagesRef.orderByChild("order");
      this.latestMessagesRef = firebase.database().ref("groupChatRoomsRef/latestMessages/"+id)
    }

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
    title: "Group Chat"
    //title: (navigation.state.params || {}).name || 'Chat!',
    //title: this.props.navigation.state.params.name
  });


  createGroupChatRoom() {
    console.log("createGroupChatRoom...")
      groupChatRoomID = ""
      users = users
      //be careful to call this function cuz user might get pushed more than once!!!
        users.push({
            name: name,
            uid: uid,
            email: email
        })
        users = users.sort(function(a, b) {
            if (a.uid < b.uid) {
                console.log("here1")
                return -1;
            }
            else if (a.uid > b.uid) {
                console.log("here2")
                return 1;
            }
            console.log("here3")
            return 0;
        })
        users.forEach(user => {
            currUid = user.uid
            if (groupChatRoomID == "") {
                groupChatRoomID = currUid
            } else {
                groupChatRoomID = groupChatRoomID+"-"+currUid
            }
        })
        //make a group chat room ref
        ref = firebase.database().ref("groupChatRoomsRef/"+groupChatRoomID)
        ref.set({
            users: users,
            groupChatRoomID: groupChatRoomID
        })
        return(groupChatRoomID)
  }

  belongToTheGroup({name, uid, email}, currUserUid) {
    if(uid == currUserUid) {
        return true;
    }
    return false;
  }


  sendMessage(messages = []) {
    messages.forEach(message => {
      var now = new Date().getTime();
      this.messagesRef.push({
        _id: now,
        text: message.text,
        createdAt: now,
        uid: currUserUid,
        fuid: uid,
        order: -1 * now,
        //experiment adding name here:
        name: name,
        users: users
      });
      this.latestMessagesRef.set({
        _id: now,
        text: message.text,
        createdAt: now,
        uid: currUserUid,
        fuid: uid,
        order: -1 * now,
        //experiment adding name here:
        name: name,
        users: users
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
    this.messagesRefData.off();
    Linking.removeEventListener('url', this.handleOpenURL)
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  componentDidMount() {
    console.log("GloChat component did mount???")

    AppState.addEventListener('change', this.handleAppStateChange);

    Linking.getInitialURL().then((ev) => {
      console.log(ev)
      if (ev != null) {
        this.handleOpenURL(ev);
      }
    }).catch(err => {
        console.warn('An error occurred', err);
    });


    this.listenForItems(this.messagesRefData)
  }

  renderBubble = props => {
    let username = props.currentMessage.user.name
    console.log(username+"'s message:")
    console.log(props.currentMessage)
    if (name == username) {
      console.log("here1...")
      return (
        <View>
          <Bubble
            {...props}
          />
          {/* <GiftedAvatar
            {...props}
              onPress={() =>
              console.log("Bubble on press....")  
            }
          /> */}
        </View>
      )
    }
    else if (props.isSameUser(props.currentMessage, props.previousMessage) 
        && props.isSameDay(props.currentMessage, props.previousMessage)) {
      console.log("here2...")
      return (
        <Bubble
          {...props}
        />
      );
    }
    else
    console.log("here3...")
    return (
      // <Bubble
      //   {...props}
      //   textStyle={{
      //     right: {
      //       color: 'white'
      //     }
      //   }}
      //   wrapperStyle={{
      //     left: {
      //       backgroundColor: color
      //     }
      //   }}
      // />
      <View>
        <Text style={styles.name}>{username}</Text>
        <Bubble
          {...props}
          textStyle={{
            right: {
              color: 'white'
            }
          }}
          //if you want different color of each message, uncomment below:
          // wrapperStyle={{
          //   left: {
          //     backgroundColor: color
          //   }
          // }}
        />
        {/* <GiftedAvatar
          {...props}
          user={props.currentMessage.user}
          onPress={() =>
            console.log("Gifted Avatar on press....")  
          }
        /> */}
      </View>
      );
  }

  onPressAvatar = () => {
    console.log("on press avatar")
  }

  renderAvatar = () => {
    return null
  }

  render() {
    return (
 


<View style={styles.container}>              

    <Text style={{
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    }}>
    {groupChatName}
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
  renderBubble={this.renderBubble}
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
export default GloChat;