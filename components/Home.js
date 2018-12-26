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
  Linking,
  Dimensions,
  Animated,
  FlatList
} from "react-native";
//import { SearchBar } from 'react-native-elements';
import SearchBar from 'react-native-search-bar';
import { StackNavigator } from "react-navigation";
import firebase from "firebase";
import Spinner from "react-native-loading-spinner-overlay";
import _ from "lodash";
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';


export default class UserList extends React.Component {

    static navigationOptions = ({ navigation }) => ({
        //title: (navigation.state.params || {}).name || 'Chat!',
        title: "UserList",
      });

    state = {
      name: "",
      //name: this.props.navigation.state.params.name,
      uid: "",
      email: "",
      query: "",
      users: [],
      groupUsers: [],
      tempMessage: "temp",
    };
    constructor(props) {
        super(props);
        this.state = {
          dataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
          }),
          groupDataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
          }),
          loading: true,
          index: 0,
          routes: [
            { key: 'first', title: 'Messages' },
            { key: 'second', title: 'Groups' },
          ],
        };
        this.friendsRef = null;
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
      if (diff >= 0 && diff <= 604800) { // in a week
        if (new Date(time).getDate() == new Date(now).getDate()) { // same day
          t = String(new Date(time).getHours()) + ":" + String(new Date(time).getUTCMinutes())//.getMinutes())
          console.log("same day")
          console.log(t.length)
          if (t.length <=4) {
            console.log(t.substring(0,t.length-1))
            console.log(t.substring(t.length-1, t.length))
            //correct time formatting issue..
            t = t.substring(0,t.length-1) + "0" + t.substring(t.length-1, t.length)
          }
        } else {
          console.log("same week")
          console.log(new Date(time).toString())
          t = String(new Date(time).toString().substring(0, 3))
        }
      } else {
        console.log("else...")
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

                var users = []
                // step 1: add individual chat msg 
                test = firebase.database().ref('chatRoomRef').orderByChild('name');
                test.on("value", snapshot => {    
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
                          createdAt: child.val().createdAt,
                          //user type for redirect to chatroom
                          roomType: "ChatRoom"
                        })
                      }
                      else if (uid == currUser.uid) {
                        users.push({
                          name: child.val().currUserName,
                          uid: child.val().currUserUid,
                          email: child.val().currUserEmail,
                          text: text,  
                          time: time,
                          createdAt: child.val().createdAt,
                          //user type for redirect to chatroom
                          roomType: "ChatRoom"         
                        })
                      }

                    });                    
                })
                // step 2: add group chat messages to users and groupUsers
                var groupUsers = []
                test2 = firebase.database().ref('groupChatRoomsRef/latestMessages')
                test2.on("value", snap => {
                  check = false;
                  snap.forEach(child => {
                    tempChatRoomId = child.key;
                    chatRoomUsers = child.val().users;
                    name = ""
                    check = false;
                    text = child.val().text
                    time = this.timeHandler(child.val().createdAt, text)
                    child.val().users.forEach(p => {
                      if(p.uid == user.uid) {
                        check = true;
                      }
                      if(name == "") {
                        name = p.name
                      }
                      else {
                        name = name + ", " + p.name
                      }
                    })
                    if (check == true) {
                        users.push({
                          createdAt: child.val().createdAt,
                          name: name,
                          groupChatRoomID: tempChatRoomId,
                          users: chatRoomUsers,
                          time: time,
                          text: text,
                          //user type for redirect to chatroom
                          roomType: "GroupChatRoom"
                        });  
                        groupUsers.push({
                          createdAt: child.val().createdAt,
                          name: name,
                          groupChatRoomID: tempChatRoomId,
                          users: chatRoomUsers,
                          time: time,
                          text: text,
                          roomType: "GroupChatRoom"
                        });                  
                    }
                   //}
                  })
                })
                //step 3: add thread chat messages to users
                test3 = firebase.database().ref('threadsRef/latestMessages/')
                test3.on("value", snap => {
                  check = false;
                  snap.forEach(child => {
                    threadChatName = child.key;
                    text = child.val().text,  
                    time = this.timeHandler(child.val().createdAt, text)
                    threadChatUsers = child.val().users;
                    threadChatUsers.forEach(user => {
                      if (user.uid == this.state.uid) {
                        users.push({
                          name: "#"+threadChatName,
                          uid: child.val().uid,
                          text: text,
                          time: time,
                          createdAt: child.val().createdAt,
                          users: child.val().users,
                          //user type for redirect to chatroom
                          roomType: "ThreadChatRoom"                       
                        })
                      }
                    })
                  })  
                  groupUsers = groupUsers.sort(function(item1, item2) {
                    if (item1.createdAt < item2.createdAt) {
                        console.log("here1")
                        return 1;
                    }
                    else if (item1.createdAt > item2.createdAt) {
                        console.log("here2")
                        return -1;
                    }
                    console.log("here3")
                    return 0;
                  })  
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
                    users: users, 
                    dataSource: this.state.dataSource.cloneWithRows(users),
                    groupUsers: groupUsers,
                    groupDataSource: this.state.groupDataSource.cloneWithRows(groupUsers)
                  })              
                })
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
              if (rowData.roomType == "GroupChatRoom") {
                this.props.navigation.navigate("GroupChatRoom", {
                  name: this.state.name,
                  email: this.state.email,
                  uid: this.state.uid,
                  users: rowData.users,
                  groupChatRoomID: rowData.groupChatRoomID,
                  groupChatName: rowData.name
                });
              } else if (rowData.roomType == "ChatRoom") {
                this.props.navigation.navigate("ChatRoom", {
                  name: name,
                  email: email,
                  uid: uid,
                  currUserName: this.state.name,
                  currUserEmail: this.state.email,
                  currUserUid: currUserUid
                });
              } else if (rowData.roomType == "ThreadChatRoom") {
                this.props.navigation.navigate("ThreadChatRoom", {
                  name: this.state.name,
                  email: this.state.email,
                  uid: this.state.uid,
                  users: rowData.users,
                  threadChatRoomID: rowData.name.substring(1,),
                  threadChatName: rowData.name
                });
              }
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
      if (user.name.toLowerCase().includes(query) //|| user.email.includes(query)
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

    _renderLabel = ({ route, index }) => {
  
      return (
        <Animated.Text style={[styles.label, ]}>
          {route.title}
        </Animated.Text>
      );
    };

    render() {

      const MessagesView = () => {
        return(
        <View style={styles.container}>
          {/* <Text style={{marginTop: 30, fontSize: 20, marginBottom: 5}}>Messages</Text> */}
          <View>
            <SearchBar 
              placeholder="Search user & history messages..." 
              //lightTheme round onChangeText =  {this.handleSearch}
              lightTheme round onChangeText={() => {this.handleSearch}}
            />
          </View>
          <ListView showsVerticalScrollIndicator={true}
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
        )
      }

      const GroupsView = () => {
        return(
          <View style={styles.container}>

            {/* <Text style={{marginTop: 30, fontSize: 20, marginBottom: 5}}>Group Chats</Text> */}
            
            <View>
              <SearchBar 
                placeholder="Search" 
                lightTheme round onChangeText = {this.handleSearch}
              />;
            </View>
            <View style={{marginTop: 5, flexDirection: "row"}}>
              <Image
                source={require("../images/groupchat.png")}
                style={styles.profileImage}
              />
              <Text style={{
                //textAlign: "center",
                fontSize: 15,
                fontWeight: "bold",
                marginBottom: 5,
                marginLeft: 5
                }}
                onPress={() => {
                  this.props.navigation.navigate("CreateNewGroupChat")   
                }}
              >
                Create Group
              </Text>
            </View>   
            <View
              style={{
                borderBottomColor: 'grey',
                borderBottomWidth: 0.5,
                marginTop: 5,
                marginBottom: 5
              }}
            />
            <Text style={{
              //textAlign: "center",
              fontSize: 15,
              fontWeight: "bold",
              marginBottom: 5
            }}>
              Your Groups
            </Text>          
            <ListView showsVerticalScrollIndicator={true}
              dataSource={this.state.groupDataSource}
              renderRow={this.renderRow}
              //renderItem={({item}) => <Text>{item.name}</Text>}
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
        )
      }  

      return (
        <TabView
          style={{marginTop: 50}}
          tabStyle={{opacity: 1, width: 90}}
          indicatorStyle={{backgroundColor: 'black',}}
          navigationState={this.state}
          renderScene={SceneMap({
            first: MessagesView,
            second: GroupsView,
          })}
          // renderLabel={route => <Text style={{ color:'black',
          // fontWeight: "500",
          // fontStyle :"normal",
          // fontSize:15, }}>{route.title}</Text>}
          renderLabel={(route, index) => {
            this._renderLabel(route, index)}}
          onIndexChange={index => this.setState({ index })}
          initialLayout={{ width: Dimensions.get('window').width }}
        />
      );
    };
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
    //flex: 1,
    justifyContent: 'center',
    //alignItems:'center',
    //backgroundColor: 'red',
    marginLeft: 5
  },
  rightContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    color: "grey",
    //backgroundColor: 'blue',
  },
  rowLabelText: {
    color: "#0B1219",
    fontSize: 16.0,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    margin: 8,
  },

});