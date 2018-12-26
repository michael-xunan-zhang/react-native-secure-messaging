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
  Alert,
  AppState,
  Linking
} from "react-native";
//import { SearchBar } from 'react-native-elements';
import SearchBar from 'react-native-search-bar';
import { StackNavigator } from "react-navigation";
import firebase from "firebase";
import Spinner from "react-native-loading-spinner-overlay";
import _ from "lodash";
import ChatRoom from "./ChatRoom";


import Chat from "./Chat";

export default class Messages extends React.Component {

    static navigationOptions = ({ navigation }) => ({
        //title: (navigation.state.params || {}).name || 'Chat!',
        title: "Messages",
      });

    state = {
      name: "",
      //name: this.props.navigation.state.params.name,
      uid: "",
      email: "",
      query: "",
      users: [],
      allUsers: [],
      tempMessage: "temp"
    };
    constructor(props) {
        super(props);
        this.state = {
          dataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
          }),
          loading: true
        };
        this.friendsRef = null;
        //this.test = firebase.database().ref('user');
    }

    createChatRoomRef(currUserUid, uid) {
      if (currUserUid > uid) {
        console.log(currUserUid + " > " + uid)
        return firebase.database().ref("chatRoomRef/"+currUserUid+"-"+uid)
      } else {
        console.log(uid + " > "+ currUserUid)
        return firebase.database().ref("chatRoomRef/"+uid+"-"+currUserUid)
      }
    }

    timeHandler(time, text) {
      // 1 min = 60 seconds
      // 1 hour = 3600 seconds
      // 1 day = 86400 seconds
      // 7 days = 604800 seconds
      t = ""
      console.log(text)
      console.log(time)
      now = new Date().getTime()
      console.log(now)
      diff = (now - time)/1000
      test = new Date(time).toString().substring(0, 3)
      console.log(new Date(time).toString())
      if (diff >= 0 && diff <= 604800) { // in a week
        if (new Date(time).getDate() == new Date(now).getDate()) { // same day
          t = String(new Date(time).getHours()) + ":" + String(new Date(time).getMinutes())
        } else {
          t = String(new Date(time).toString().substring(0, 3))
        }
      } else {
        t = String(new Date(time).toString().substring(4, 10))
      }
      console.log(t)
      return(t)   
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
      AppState.addEventListener('change', this.handleAppStateChange);

      Linking.getInitialURL().then((ev) => {
        console.log(ev)
        if (ev != null) {
          this.handleOpenURL(ev);
        }
      }).catch(err => {
          console.warn('An error occurred', err);
      });


        firebase
        .auth()
        .onAuthStateChanged(user => {
            if (user) {
                var currUser = user;
                a = firebase.database().ref(`user/${user.uid}/name`)
                a.on("value", snapshot => {
                  this.setState({ // all current user info
                    name: snapshot.val(), 
                    email: user.email,
                    uid: user.uid,
                })
                })
                //additional
                t = firebase.database().ref('user').orderByChild('name');
                t.on("value", snapshot => {    
                    var allUsers = [];
                    snapshot.forEach(child => {
                        if(child.val().uid != user.uid) {
                            console.log("pushing a user")
                            console.log(child.val().name)
                            console.log(child.val().uid)
                            allUsers.push({
                                name: child.val().name,
                                uid: child.val().uid,
                                email: child.val().email
                            })
                        }
                    });
                    this.setState({
                      allUsers: allUsers
                    })
                });

                // list of users order by name/key:
                test = firebase.database().ref('chatRoomRef').orderByChild('name');
                test.on("value", snapshot => {    
                    var users = [];
                    snapshot.forEach(child => {
                      currUserEmail = child.val().currUserEmail 
                      currUserName = child.val().currUserName
                      currUserUid = child.val().currUserUid
                      email = child.val().email
                      name = child.val().name
                      uid = child.val().uid
                      text = child.val().text
                      time = this.timeHandler(child.val().createdAt, text)
                      if (currUserUid == currUser.uid) {
                        users.push({
                          name: child.val().name,
                          uid: child.val().uid,
                          email: child.val().email,
                          text: text,
                          time: time,
                          createdAt: child.val().createdAt
                        })
                      }
                      else if (uid == currUser.uid) {
                        users.push({
                          name: child.val().currUserName,
                          uid: child.val().currUserUid,
                          email: child.val().currUserEmail,
                          text: text,  
                          time: time,
                          createdAt: child.val().createdAt                
                        })
                      }

                    });

                    users = users.sort(function(a, b) {
                      if (a.createdAt < b.createdAt) {
                          console.log("here1")
                          return 1;
                      }
                      else if (a.createdAt > b.createdAt) {
                          console.log("here2")
                          return -1;
                      }
                      console.log("here3")
                      return 0;
                    })
                    console.log(users)

              
                    this.setState({
                        dataSource: this.state.dataSource.cloneWithRows(users),
                        loading: false,
                        friendsRef: test,
                        users: users
                    })
                    
                })
                //this.listenForItems(this.friendsRef);
            }
        })
      }

      renderRow = rowData => {
        return (
          <TouchableOpacity
            onPress={() => {
              name = rowData.name;
              email = rowData.email;
              uid = rowData.uid;
              currUserUid = this.state.uid;
              this.props.navigation.navigate(ChatRoom, {
                name: name,
                email: email,
                uid: uid,
                currUserName: this.state.name,
                currUserEmail: this.state.email,
                currUserUid: currUserUid
              });
            }}
          >

{/* check reference here:
https://stackoverflow.com/questions/40065708/react-native-how-to-align-inline-text */}

          <View style={styles.textContainer2}>
            <View>
              <Image
                source={require("../default_avatar.png")}
                style={styles.profileImage}
              />
            </View>
            <View style={styles.leftContainer}>
              <Text style={styles.rowLabelText}>
                {rowData.name}
              </Text>
            </View>

            <View style={styles.rightContainer}>
              <Text style={{color: "grey"}}>
                {rowData.time}
              </Text>
            </View>
          </View>
          <Text style={{marginBottom: 10, marginLeft: 50, color: "grey"}}>{rowData.text}</Text>

          </TouchableOpacity>
        );
      };

    contains = (user, query) => {
      if (user.name.includes(query) || user.email.includes(query)
            || user.text.toLowerCase().includes(query)) {
        console.log("true")
        return true;
      }
      console.log("false")
      return false;
    };


    handleSearch = (text) => {
      const formatQuery = text.toLowerCase();
      const filteredUsers = _.filter(this.state.users, user=> {
        return this.contains(user, formatQuery)
      })
      this.setState({
        query: text,
        dataSource: this.state.dataSource.cloneWithRows(filteredUsers)
      })
    }


    render() {
      console.log("UserList render view.......")
        return (
          <View style={styles.container}>

            {/* <Text style={{marginTop: 30, fontSize: 20, marginBottom: 5}}>Messages</Text> */}

            <View>
              <SearchBar 
                placeholder="Search user & history messages..." 
                lightTheme round onChangeText = {this.handleSearch}
              />
            </View>

            <ListView
              dataSource={this.state.dataSource}
              renderRow={this.renderRow}
            />
            <Button
                buttonStyle={{ marginTop: 20 }}
                backgroundColor="#03A9F4"
                title="Logout"
                onPress={() => {
                  console.log("logging out...")
                  firebase
                  .auth()
                  .signOut()
                  console.log("signed out")
                  this.props.navigation.navigate("SignedOut")
                }}
            >
                Log out
            </Button>
          </View>
        );
      }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    marginRight: 10,
    marginLeft: 10
  },
  rightButton: {
    marginTop: 10,
    marginLeft: 5,
    marginRight: 10,
    padding: 0
  },
  topGroup: {
    flexDirection: "row",
    margin: 10
  },
  myFriends: {
    flex: 1,
    color: "#3A5BB1",
    //tintColor: "#fff",
    //secondaryColor: '#E9E9E9',
    //grayColor: '#A5A5A5',
    fontSize: 16,
    padding: 5
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 6,
    marginBottom: 8
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 6
  },
  profileName: {
    marginLeft: 6,
    fontSize: 16
  },
  latestMessageContainer: {
    color: "grey",
    flex: 1,
    alignItems: "stretch",
    //marginRight: 10,
    marginLeft: 50,
    //marginTop: 40
  },
  latestMessageContainer: {
    color: "grey",
    flex: 1,
    alignItems: "stretch",
    //marginRight: 10,
    marginLeft: 50,
    //marginTop: 40
  },
  textContainer: {
    marginLeft: 30,
    color: "grey"
  },
  rowViewContainer: {
    flex: 1,
    paddingRight: 15,
    paddingTop: 0,
    //paddingBottom: 13,
    borderBottomWidth: 0.5,
    borderColor: '#c9c9c9',
    flexDirection: 'row',
    alignItems: 'center',
  },

  textContainer2:{
    flexDirection: 'row',
    height: 30,
    //backgroundColor: 'green'
  },
  leftContainer:{
    flex: 1,
    justifyContent: 'center',
    //alignItems:'center',
    //backgroundColor: 'red',
    marginLeft: 5
  },
  rightContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    color: "grey"
    //backgroundColor: 'blue',
  },
  rowLabelText: {
    color: "#0B1219",
    fontSize: 16.0,
  },
});