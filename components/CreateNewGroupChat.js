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
import { SearchBar } from 'react-native-elements';
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
    };
    constructor(props) {
        super(props);
        this.state = {
          dataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
          }),
          selectedUsers: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
          }),
          selectedUsersList: [],
          loading: true
        };
        this.friendsRef = null;
        //this.test = firebase.database().ref('user');
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
        return (
          <TouchableOpacity
            onPress={() => {
              temp = this.state.selectedUsersList
              name = rowData.name;
              email = rowData.email;
              uid = rowData.uid;
              currUser = {name, uid, email}
              const filteredUsers = _.filter(this.state.selectedUsersList, user=> {
                return this.addingDuplicateUser(user, currUser)
              })
              if(filteredUsers.length == 0) {
                temp.push({ 
                    name: name,
                    uid: uid,
                    email: email
                    })
              }
              this.setState({
                selectedUsersList: temp
            })
              this.setState({
                selectedUsers: this.state.selectedUsers.cloneWithRows(this.state.selectedUsersList)
              })
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
          </TouchableOpacity>
        );
      };



      renderRow2 = rowData => {
        return (
          <TouchableOpacity
            onPress={() => {
              temp = this.state.selectedUsersList
              name = rowData.name;
              email = rowData.email;
              uid = rowData.uid;
              currUser = {name, uid, email}
              const filteredUsers = _.filter(this.state.selectedUsersList, user=> {
                return this.removeUser(user, currUser)
              })
              this.setState({
                selectedUsersList: filteredUsers
              })
              this.setState({
                selectedUsers: this.state.selectedUsers.cloneWithRows(filteredUsers)
              })              
              
            }}
          >
            <View style={styles.profileContainer}>
              <Text style={styles.profileName}>{rowData.name}</Text>
              <Image
                // source={{
                //   uri: "https://www.gravatar.com/avatar/"
                // }}
                source={require("../images/close.png")}
                style={styles.profileImage2}
              />
            </View>
          </TouchableOpacity>
        );
      };


    contains = ({ name, uid, email }, query) => {
      //const { first, last } = name;
      if (name.includes(query) || email.includes(query)) {
        console.log("true")
        return true;
      }
      console.log("false")
      return false;
    };

    addingDuplicateUser = ({ name, uid, email }, currUser) => {
        if (name == currUser.name && uid == currUser.uid && email == currUser.email) {
          console.log("true")
          return true;
        }
        console.log("false")
        return false;
      };

    removeUser = ({ name, uid, email }, currUser) => {
        if (name == currUser.name && uid == currUser.uid && email == currUser.email) {
          console.log("we have the user, but we want to remove it, so return false")
          return false;
        }
        console.log("otherwise")
        return true;
      };

    handleSerach = (text) => {
      const formatQuery = text.toLowerCase();
      const filteredUsers = _.filter(this.state.users, user=> {
        return this.contains(user, formatQuery)
      })
      this.setState({
        query: text,
        dataSource: this.state.dataSource.cloneWithRows(filteredUsers)
      })
    }

    createGroupChatname() {
        groupChatName = ""
        this.state.selectedUsersList.forEach(user => {
            if (groupChatName == "") {
                groupChatName = user.name
            } else {
                groupChatName = groupChatName + ", " + user.name
            }
        })
        groupChatName = groupChatName + ", " + this.state.name
        return groupChatName
    }

    render() {
      console.log("UserList render view.......")
        return (
          <View style={styles.container}>

            
            <View style={styles.topGroup}>
              <TouchableHighlight 
                style ={{
                    height: 40,
                    width: 600,
                    //borderRadius:10,
                    backgroundColor : "white",
                    marginLeft : 0,
                    //marginRight:50,
                    marginTop :50
                }}>
            <Text style={styles.promptText}>
            Selected Users (Tap to unselect)
            </Text>
            </TouchableHighlight> 
          </View>

          <View style={{height: 85}}>  
          <ListView
            initialListSize={1}
            pageSize={1}
            dataSource={this.state.selectedUsers}
            renderRow={this.renderRow2}
          />
          </View>



            <View style={styles.topGroup}>
              <TouchableHighlight 
                style ={{
                    height: 40,
                    width: 300,
                    //borderRadius:10,
                    backgroundColor : "white",
                    marginLeft : 0,
                    //marginRight:50,
                    marginTop :50
                }}>
            <Text style={styles.promptText}>
            Plese search and add users to create group chat
            </Text>
            </TouchableHighlight> 
          </View>

          {/* <View>
            <SearchBar 
              placeholder="Type Here..." 
              lightTheme round onChangeText = {this.handleSerach}
            />;
          </View> */}

          <View style={{height: 300}}> 
          <ListView
            initialListSize={1}
            pageSize={1}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
          />
          </View>


            <View> 
              <TouchableHighlight 
                style ={{
                    height: 40,
                    width: 100,
                    borderRadius:10,
                    backgroundColor : "white",
                    marginLeft : 120,
                    //marginRight:50,
                    //marginTop :50
                }}>
            {/* <Text 
                style={styles.createText}
                onPress={console.log("pressing!!!!!")}
            >
            Create
            </Text> */}
            <Button
                buttonStyle={{ marginTop: 20 }}
                backgroundColor="#03A9F4"
                title="Create"
                onPress={() => {
                    if (this.state.selectedUsersList.length == 1) {
                        Alert.alert("You need to select more than 1 user to create a chat room! Redirected to individual chat with " + `${this.state.selectedUsersList[0].name}` + ".")
                        this.props.navigation.navigate("ChatRoom", {
                            name: name,
                            email: email,
                            uid: this.state.selectedUsersList[0].uid,
                            currUserName: this.state.name,
                            currUserEmail: this.state.email,
                            currUserUid: this.state.uid
                          });

                    } else {
                        this.props.navigation.navigate("GroupChatRoom", {
                            name: this.state.name,
                            email: this.state.email,
                            uid: this.state.uid,
                            users: this.state.selectedUsersList,
                            groupChatRoomID: "",
                            groupChatName: this.createGroupChatname()
                        });
                    }
                    
                }}
            />
            </TouchableHighlight> 
          </View>
          <View> 
              <TouchableHighlight 
                style ={{
                    height: 40,
                    width: 100,
                    borderRadius:10,
                    backgroundColor : "white",
                    marginLeft : 120,
                    //marginRight:50,
                    //marginTop :50
                }}>
            {/* <Text style={styles.createText}>
            Cancel
            </Text> */}
            <Button
                buttonStyle={{ marginTop: 20 }}
                backgroundColor="#03A9F4"
                title="Cancel"
                onPress={() => {
                    this.props.navigation.navigate("SignedIn")
                }}
            />
            </TouchableHighlight> 
          </View>

          <Spinner visible={this.state.loading} />

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
      marginTop: 2,
      marginLeft: 6,
      marginBottom: 2
    },
    profileImage: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginLeft: 6
    },
    profileImage2: {
      width: 16,
      height: 16,
      borderRadius: 15,
      marginLeft: 2
    },
    profileName: {
      marginLeft: 6,
      fontSize: 16
    },
    promptText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    createText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "blue"
    },
    button: {
      height: 50,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignSelf: "stretch",
      marginTop: 10,
      justifyContent: "center",
      paddingVertical: 15,
      marginBottom: 10
    },
  });