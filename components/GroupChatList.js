import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
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

export default class Groups extends React.Component {

    static navigationOptions = ({ navigation }) => ({
        //title: (navigation.state.params || {}).name || 'Chat!',
        title: "Groups",
      });

    state = {
      name: "",
      //name: this.props.navigation.state.params.name,
      uid: "",
      email: "",
      query: "",
      users: [],
      usersForNavigation: [],
      groupChatInfo: []
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

    timeHandler(time) {
      // 1 min = 60 seconds
      // 1 hour = 3600 seconds
      // 1 day = 86400 seconds
      // 7 days = 604800 seconds
      const SECONDS_ONE_WEEK = 604800
      t = ""
      console.log(time)
      now = new Date().getTime()
      console.log(now)
      diff = (now - time)/1000
      test = new Date(time).toString().substring(0, 3)
      console.log(new Date(time).toString())
      //console.log(test)
      if (diff >= 0 && diff <= SECONDS_ONE_WEEK) { 
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

    belongToTheGroup({name, uid, email}, currUserUid) {
      if(uid == currUserUid) {
          console.log("true")
          return true;
      }
      console.log("false")
      return false;
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

                //set state (new add)
                this.setState({ // all current user info
                    name: user.name,
                    email: user.email,
                    uid: user.uid,
                })

                test2 = firebase.database().ref('groupChatRoomsRef/latestMessages')
                test2.on("value", snap => {
                  var a = [];
                  var b = [];
                  check = false;
                  snap.forEach(child => {
                    //if (child.key != "latestMessages") {
                    console.log("looooooooooooooooooop....")
                    //we might use it!!!!!
                    tempChatRoomId = child.key;
                    chatRoomUsers = child.val().users;
                    name = ""
                    check = false;
                    time = this.timeHandler(child.val().createdAt)
                    text = child.val().text
                    child.val().users.forEach(p => {
                      console.log("each p:" + p)
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
                        a.push({
                          createdAt: child.val().createdAt,
                          name: name,
                          groupChatRoomID: tempChatRoomId,
                          users: chatRoomUsers,
                          time: time,
                          text: text
                        })                      
                    }
                   //}
                  })
                  a = a.sort(function(item1, item2) {
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
                  console.log(a)
                  this.setState({
                    groupChatInfo: a,
                    dataSource: this.state.dataSource.cloneWithRows(a),
                  })
                })
          }
        })
      }

      renderRow = rowData => {
        console.log(rowData)
        return (

          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate("GroupChatRoom", {
                name: this.state.name,
                email: this.state.email,
                uid: this.state.uid,
                users: rowData.users,
                groupChatRoomID: rowData.groupChatRoomID,
                groupChatName: rowData.name
              });
            }}
          >

            {/* New implementations */}
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

    contains = (group, query) => {
      if (group.name.toLowerCase().includes(query)
          || group.text.toLowerCase().includes(query)) {
        console.log("true")
        return true;
      }
      console.log("false")
      return false;
    };

    handleSearch = (text) => {
      const formatQuery = text.toLowerCase();
      const filteredUsers = _.filter(this.state.groupChatInfo, group=> {
        return this.contains(group, formatQuery)
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

          <Text style={{marginTop: 30, fontSize: 20, marginBottom: 5}}>Group Chats</Text>
          
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

          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            //renderItem={({item}) => <Text>{item.name}</Text>}
          />

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
      width: 25,
      height: 25,
      borderRadius: 15,
      marginLeft: 6
    },
    profileName: {
      marginLeft: 6,
      fontSize: 16
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
