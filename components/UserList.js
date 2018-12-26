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
  Linking,
  AppState
} from "react-native";
//import { SearchBar } from 'react-native-elements';
import SearchBar from 'react-native-search-bar';
import { StackNavigator } from "react-navigation";
import firebase from "firebase";
import Spinner from "react-native-loading-spinner-overlay";
import _ from "lodash";


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

                // list of users order by name/key:
                test = firebase.database().ref('user').orderByChild('name');
                test.on("value", snapshot => {    
                    var users = [];
                    snapshot.forEach(child => {
                        if(child.val().uid != currUser.uid) {
                            users.push({
                                name: child.val().name,
                                uid: child.val().uid,
                                email: child.val().email
                            })
                        }
                        else {
                            this.setState({
                                name: child.val().name,
                                uid: child.val().uid,
                                email: child.val().email
                            })
                        }

                    });
                    this.setState({
                        dataSource: this.state.dataSource.cloneWithRows(users),
                        loading: false,
                        friendsRef: test,
                        users: users
                    })
                    
                })
            }
        })
      }

      renderRow = rowData => {
        // currRef = this.createChatRoomRef(this.state.uid, rowData.uid);
        // currRef.on("value", snap => {
        //   console.log(snap.val())
        //   console.log(snap.val().text)
        //   this.setState
        //   msg = snap.val().text
        // })
        // console.log(msg)
        return (
          <TouchableOpacity
            onPress={() => {
              name = rowData.name;
              email = rowData.email;
              uid = rowData.uid;
              currUserUid = this.state.uid;
              this.props.navigation.navigate("ChatRoom", {
                name: name,
                email: email,
                uid: uid,
                currUserName: this.state.name,
                currUserEmail: this.state.email,
                currUserUid: currUserUid
              });
            }}
          >
            <View style={styles.profileContainer}>
              <Image
                // source={{
                //   uri: "https://www.gravatar.com/avatar/"
                // }}
                source={require("../default_avatar.png")}
                style={styles.profileImage}
              />
              <Text style={styles.profileName}>{rowData.name}</Text>
            </View>
            {/* <Text style={styles.latestMessageContainer}>{msg}</Text> */}
          </TouchableOpacity>
        );
      };

    contains = ({ name, uid, email }, query) => {
      if (name.includes(query) || email.includes(query)) {
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

          <Text style={{marginTop: 30, fontSize: 20, marginBottom: 5}}>Contacts</Text>

          <View>
            <SearchBar 
              placeholder="Search user..." 
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
  });