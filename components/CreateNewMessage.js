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
          loading: true,
          text: "",
          reference: "",
        };
        this.friendsRef = null;


        //url scheme
        const { params } = this.props.navigation.state;
        url = params.url;
    }

    handleOpenURL = (event) => {
        console.log("handleOpenUrl??????")
        //if still in CreateNewMessage state
        if (this.props.navigation.state.key == "CreateNewMessage") {
          //handle url
          var regex = /[?&]([^=#]+)=([^&#]*)/g,
              params = {},
              match;
          while (match = regex.exec(event.url)) {
              params[match[1]] = match[2];
          }
          console.log(params)  
          this.setState({reference: params})      
          //setState of text:
          var str = "MRN: " + String(params.mrn) + "\n" + "Reason For Visit: " + String(params.rfv).split("%20").join(" ")
          console.log(str)
          this.setState({text: str})        
  
  
        } else {
          this.props.navigation.navigate("CreateNewMessage", {
              url: event.url
          })
        }
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
                        dataSource: this.state.dataSource.cloneWithRows([]),
                        loading: false,
                        friendsRef: test,
                        users: users
                    })
                    
                })
            }
        })

        //handle URL
        var regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match;
        while (match = regex.exec(url)) {
            params[match[1]] = match[2];
        }
        console.log(params)  
        this.setState({reference: params})      
        //setState of text:
        var str = "MRN: " + String(params.mrn) + "\n" + "Reason For Visit: " + String(params.rfv).split("%20").join(" ")
        console.log(str)
        this.setState({text: str})        
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
            console.log(this.state.selectedUsersList)
            
              this.setState({
                selectedUsers: this.state.selectedUsers.cloneWithRows(this.state.selectedUsersList),
                dataSource: this.state.dataSource.cloneWithRows([])
              })
            }}
          >
            <View style={styles.profileContainer}>
              {/* <Image
                source={require("../default_avatar.png")}
                style={styles.profileImage}
              /> */}
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
              {/* <Image
                source={require("../default_avatar.png")}
                style={styles.profileImage}
              /> */}
              <Text style={styles.profileName}>{rowData.name}</Text>
              <Image
                source={require("../images/close.png")}
                style={styles.profileImage}
              />
            </View>
          </TouchableOpacity>
        );
      };


    contains = ({ name, uid, email }, query) => {
      //const { first, last } = name;
      if (query == "") {
        console.log("empty query...")
        return false
      } else if (name.includes(query) || email.includes(query)) {
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

    createThreadID(mrn, fin) {
        return(mrn+"-"+fin)
    }

    getCurrentTime() {
        return(new Date().getTime())
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

          <View style={{height: 80}}>  
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

          <View>
            <SearchBar 
              placeholder="Search for user..." 
              lightTheme round onChangeText = {this.handleSearch}
            />
          </View>

          <View style={{height: 50}}> 
          <ListView
            initialListSize={1}
            pageSize={1}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
          />
          </View>


        <View style={{marginBottom: 20}}>
        <Text>Enter your message below: </Text>
        </View>  
        
          <TextInput
            style={{height: 100, borderColor: 'gray', borderWidth: 1}}
            editable={true}
            multiline={true}
            onChangeText={this.handleChangeText}
            value={this.state.text}
            //placeholder="Enter you message here." 
          />

            <Button
                buttonStyle={{ marginTop: 20 }}
                backgroundColor="#03A9F4"
                title="Create and Send"
                onPress={() => {
                    threadID = this.createThreadID(String(this.state.reference.mrn),
                                                    String(this.state.reference.FIN))
                    if (this.state.selectedUsersList.length == 0) {
                        Alert.alert("You need to select at least one user!")
                    } else if (this.state.selectedUsersList.length > 1) {
                        thread = firebase.database()
                                .ref("threads/" + threadID)

                        var now = this.getCurrentTime()
                        users = this.state.selectedUsersList
                        users.push({ 
                            name: this.state.name,
                            uid: this.state.uid,
                            email: this.state.email
                            })
                        thread.push({
                            _id: now,
                            text: this.state.text,
                            createdAt: now,
                            uid: this.state.uid,
                            order: -1 * now,
                            //experiment adding name here:
                            name: this.state.name,
                            user: {
                                _id: this.state.uid,
                                name: this.state.name,
                            },
                            users: users,
                            messageType: "text",
                            image: ""
                        });
                        threadRef = firebase.database()
                                    .ref("threadsRef/latestMessages/" + threadID)
                        threadRef.set({
                            _id: now,
                            text: this.state.text,
                            createdAt: now,
                            uid: this.state.uid,
                            order: -1 * now,
                            //experiment adding name here:
                            name: this.state.name,
                            user: {
                                _id: this.state.uid,
                                name: this.state.name,
                            },
                            users: users,
                            messageType: "text",
                            image: ""
                        });
                        this.props.navigation.navigate("ThreadChatRoom", {
                            name: this.state.name,
                            email: this.state.email,
                            uid: this.state.uid,
                            users: this.state.selectedUsersList,
                            threadChatRoomID: threadID,
                            threadChatName: "#"+threadID
                          });                        

                    }

                }}
            >
            </Button>
            <Button
                backgroundColor="#03A9F4"
                title="Cancel"
                onPress={() => {
                    this.props.navigation.navigate("SignedIn")
                }}
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
      marginTop: 2,
      marginLeft: 6,
      marginBottom: 2
    },
    profileImage: {
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
