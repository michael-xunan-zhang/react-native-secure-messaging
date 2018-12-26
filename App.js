// Import the screens
import Login from './auth/Login';
//import Register from './auth/Register';
import GroupChatRoom from './components/GroupChatRoom';
import GroupChatList from './components/GroupChatList';
import UserList from './components/UserList';
import ChatRoom from './components/ChatRoom';
import Home from './components/Home';
import CreateNewGroupChat from './components/CreateNewGroupChat';
import CreateNewMessage from './components/CreateNewMessage';
import ThreadChatRoom from './components/ThreadChatRoom';
// Import React Navigation
import { 
  createStackNavigator, 
  createBottomTabNavigator,
  createSwitchNavigator,
  createMaterialTopTabNavigator
} from 'react-navigation';
import React from 'react';
import { View, Button, Text, Alert, Platform, Image, StatusBar } from "react-native";
import * as firebase from "firebase";
import { FormLabel, FormInput, Card } from "react-native-elements";
import { FontAwesome } from "react-native-vector-icons";



const createRootNavigator = (loggedIn = false) => {
  return createSwitchNavigator(
    {
      SignedIn: {
        screen: SignedIn
      },
      SignedOut: {
        screen: Login
      },
      ChatRoom: {
        screen: ChatRoom
      },
      CreateNewGroupChat: {
        screen: CreateNewGroupChat
      },
      GroupChatRoom: {
        screen: GroupChatRoom
      },
      CreateNewMessage: {
        screen: CreateNewMessage
      },
      ThreadChatRoom: {
        screen: ThreadChatRoom
      }

    },
    {
      initialRouteName: loggedIn ? "SignedIn" : "SignedOut"
    }
  );
};

const SignedIn = createBottomTabNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: {
        tabBarLabel: "Home",
        // tabBarIcon: ({ tintColor }) => (
        //   <FontAwesome name="home" size={30} color={tintColor} />
        // )
        tabBarIcon: 
        <Image
          style={{width: 30, height: 30}}
          source={require("./images/home.png")}
        />
      }
    },  
    UserList: {
      screen: UserList,
      navigationOptions: {
        tabBarLabel: "Contacts",
        // tabBarIcon: ({ tintColor }) => (
        //   <FontAwesome name="home" size={30} color={tintColor} />
        // )
        tabBarIcon: 
        <Image
          style={{width: 30, height: 30}}
          source={require("./images/contacts.png")}
        />
      }
    },    
    // GroupChatList: {
    //   screen: GroupChatList,
    //   navigationOptions: {
    //     tabBarLabel: "Groups",
    //     // tabBarIcon: ({ tintColor }) => (
    //     //   <FontAwesome name="home" size={30} color={tintColor} />
    //     // )
    //     tabBarIcon: 
    //     <Image
    //       style={{width: 30, height: 30}}
    //       source={require("./images/groupchat.png")}
    //     />
    //   }
    // },
  },
  {
    tabBarOptions: {
      style: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
      }
    }
  }  
);

const UserListAndIndividualChat = createStackNavigator({
  UserList: { screen: UserList },
  ChatRoom: { screen: ChatRoom }
});



export default class App extends React.Component { 
  state = {
    loggedIn : false
  }

  render() {
    const Layout = createRootNavigator(this.state.loggedIn);
    return <Layout />;
  }
}
