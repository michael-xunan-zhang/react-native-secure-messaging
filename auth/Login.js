import React from "react";
import {YellowBox} from 'react-native';
YellowBox.ignoreWarnings(['Warning: ...']);
console.disableYellowBox = true;
//import Fire.js to firebase.initialize() the APK, must inclued step
import Fire from "../Fire";
//import Expo from "expo";
import { 
  View, 
  StyleSheet, 
  Alert, 
  NativeModules, 
  Platform, 
  Image, 
  Text, 
  Linking,
  AppState
 } from "react-native";
import { Card, Button, FormLabel, FormInput, TextInput } from "react-native-elements";
import { FontAwesome } from "react-native-vector-icons";
import {
    StackNavigator,
    TabNavigator,
    SwitchNavigator,
    NavigationActions
  } from "react-navigation";
//import firebase from "react-native-firebase";
import firebase from "firebase";
import Spinner from "react-native-loading-spinner-overlay";
import UserList from '../components/UserList';
import TouchID from "react-native-touch-id";
//import {RSA, RSAKeychain} from "react-native-rsa-native";
import {Crypt, keyManager, RSA} from 'hybrid-crypto-js';

var bb = "bb"

const optionalConfigObject = {
  title: "Authentication Required", // Android
  color: "#e00606", // Android,
  fallbackLabel: "Show Passcode" // iOS (if empty, then label is hidden)
}

export default class Login extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        title: 'Login',
      });

    constructor() {
        super();
        this.state = {
          email: "",
          password: "",
          name: "",
          loading: false,
          errorMessage: null,
          createNewMessage: false,
          url: "",
          compatible: false,

          //testing
          public_key_1: "",
          private_key_1: "",
          public_key_2: "",
          private_key_2: "",
          public_key_3: "",
          private_key_3: "",
        };
    }

  
    handleChangeEmail = (text) => {
      this.setState({
        email: text,
      });
    }
    handleChangePassword = (text) => {
      this.setState({
        password: text,
      });
    }
  
    getRef() {
      return firebase.database().ref();
    }

    clickSignInCheck = () => {
      console.log('clickSignInCheck...');
      this.firebaseLogin();
    }

    set_params(name, email, uid) {
      const setParamsAction = NavigationActions.setParams({
        params: { name: name, email: email, uid: uid },
        key: "Home"
      })
      this.props.navigation.dispatch(setParamsAction)
    }


    async firebaseLogin() {
        const{ email, password } = this.state;
        console.log("firebaselogin")
        firebase
          .auth()
          //.signInWithEmailAndPassword(this.state.email, this.state.password)
          .signInWithEmailAndPassword("michael.zhang@vituity.com", "123456")
          .then((user) => {
              this.setState({ 
                loading: false,
               })
              this.set_params(user.name, user.email, user.uid);
              if (this.state.createNewMessage) {
                console.log("go to CreateNewMessage")
                this.props.navigation.navigate("CreateNewMessage", {
                  url: this.state.url
                })
              } else {
                console.log("go to SignedIn")
                this.props.navigation.navigate('SignedIn');
              }
          })
          .catch(error => {
              console.log("we caught an error message")
              console.log(error.message)
              this.setState({
                  errorMessage: error.message, // +" Try again and make sure your email is correct.",
                  loading: false
              })
              if (this.state.errorMessage != null) {
                console.log("incorrect password case")
                Alert.alert(this.state.errorMessage);
                return;
              } else {
                console.log("at navigation stage");
                console.log(this.state.createNewMessage)
                if (this.state.createNewMessage) {
                  console.log("here1")
                  this.props.navigation.navigate("CreateNewMessage", {
                    url: this.state.url
                  })
                } else {
                  console.log("here2")
                  this.props.navigation.navigate('UserList');
                }
              }
          })
    }


    handleOpenURL = (event) => {
      console.log("handleOpenUrl??????")
      url = event.url
      console.log(url)
      this.setState({
        createNewMessage: true,
        url: event.url
      })
      Alert.alert("Please log in first!")
    }

    handleAppStateChange = (nextAppState) => {
      console.log("handle app state change???")
      Linking.addEventListener('url', this.handleOpenURL);
    }

    checkDeviceForHardware() {
      TouchID.authenticate('to demo this react-native component', optionalConfigObject)
        .then(success => {
          console.log('Authenticated Successfully');
        })
        .catch(error => {
          console.log('Authentication Failed');
        });
        TouchID.isSupported()
        .then(biometryType => {
          // Success code
          if (biometryType == 'FaceID') {
            console.log('FaceID is supported.');
          } else if (biometryType == 'TouchID'){
            console.log('TouchID is supported.');
          } else if (biometryType == true) {
            // Touch ID is supported on Android
            console.log("touch id is supported on Android")
          }
        })
        .catch(error => {
          // Failure code if the user's device does not have touchID or faceID enabled
          console.log("we have an error")
          console.log(error);
        });
    }


    componentDidMount() {
      //test touch id
      //this.checkDeviceForHardware();
      //check if app state changes:
      AppState.addEventListener('change', this.handleAppStateChange);

      // if (Platform.OS == "android") {
      //   Linking.getInitialURL().then(url =>{
      //     this.navigate(url);
      //   })
      // } else {
      //   console.log("iOS??????")
      //   Linking.addEventListener('url', this.handleOpenURL)
      // }
      Linking.getInitialURL().then((ev) => {
        console.log(ev)
        if (ev != null) {
          this.handleOpenURL(ev);
        }
      }).catch(err => {
          console.warn('An error occurred', err);
      });
      //Linking.addEventListener('url', this.handleOpenURL);

      //testing url:
      // var url = "madssecuremessaging://?mrn=1234&rfv=come%20into%20hospital"
      // var regex = /[?&]([^=#]+)=([^&#]*)/g,
      //   params = {},
      //   match;
      // while (match = regex.exec(url)) {
      //   params[match[1]] = match[2];
      // }
      // console.log(params)
      // console.log("come%20into%20hospital".split("%20").join(" "))

      // RSA.generateKeys(4096) // set key size
      // .then(keys => {
      //   console.log('4096 private:', keys.private) // the private key
      //   console.log('4096 public:', keys.public) // the public key
      // })

      //testing...
      // RSA.generate()
      // .then(keys1 => {
      //   RSA.generate()
      //   .then(keys2 => {
      //     RSA.generate()
      //     .then(keys3 => {
      //       this.setState({
      //         public_key_1: keys1.public,
      //         public_key_2: keys2.public,
      //         public_key_3: keys3.public,
      //         private_key_1: keys1.private,
      //         private_key_2: keys2.private,
      //         private_key_3: keys3.private,
      //       })
      //     })            
      //   })        
      // })

      //test rsa key:
    //   RSA.generate() 
    //   .then(keys => {
    //     console.log('private: ', keys.private) // the private key
    //     console.log('public: ', keys.public) // the public key
    //     RSA.encrypt('Hello world!', keys.public)
    //     .then(encryptedMessage => {
    //       console.log("encrypted message:");
    //       console.log(encryptedMessage)
    //       RSA.decrypt(encryptedMessage, keys.private)
    //       .then(decryptedMessage => {
    //         console.log("decrypted message:");
    //         console.log(decryptedMessage);
    //       })
    //     })
    //   })    
    

    // var RSA = require('hybrid-crypto-js').RSA;
    // var rsa = new RSA();
    // public_key_1 = ""
    // public_key_2 = ""
    // public_key_3 = ""
    // private_key_1 = ""
    // private_key_2 = ""
    // public_key_3 = ""
    // rsa.generateKeypair()
    
    // rsa.generateKeypair(function(keys1) {
    //   // Callback function receives new keypair as a first argument
    //   public_key_1 = keys1.publickey;
    //   private_key_1 = keys1.privatekey;
    //   rsa.generateKeypair(function(keys2) {
    //     public_key_2 = keys2.publickey;
    //     private_key_2 = keys2.privatekey;
    //     rsa.generateKeypair(function(keys3) {
    //       public_key_3 = keys3.publickey;
    //       private_key_3 = keys3.privatekey;
    //       // this.setState({
    //       //   public_key_1: keys1.publicKey,
    //       //   public_key_2: keys2.publicKey,
    //       //   public_key_3: keys3.publicKey,
    //       //   private_key_1: keys1.privateKey,
    //       //   private_key_2: keys2.privateKey,
    //       //   private_key_3: keys3.privateKey,
    //       // })        
    //     })        
    //   })
    // });
    // console.log(public_key_1)

    

      // Callback function receives new keypair as a first argument
      // keyManager.getKeys(function(keypair) {

        // Callback function receives new keypair as a first argument
        //console.log(keypair)
        // return(keypair)
      // })
      
      
    }

    helper() {
      console.log("help.....")
    }
    componentWillUnmount() {
      console.log("component Will Unmount...")
      Linking.removeEventListener('url', this.handleOpenURL)
      AppState.removeEventListener('change', this.handleAppStateChange);
    }

    render() {
      // console.log(this.state.public_key_1,this.state.private_key_1,
      //    this.state.public_key_2, this.state.private_key_2,
      //    this.state.public_key_3, this.state.private_key_3,)
      console.log(bb)
      var Crypt = require('hybrid-crypto-js').Crypt;
      var crypt = new Crypt();
      // RSA.encrypt('Hello world!', [this.state.public_key_1,this.state.public_key_2])
      //   .then(encryptedMsg => {
      //     console.log(encryptedMsg)
      //   })
      console.log("rendering>>>>??/")
        return(
          //<View style={{ paddingVertical: 20 }}>
          //<View style={styles.container}>
          <View style={{ paddingVertical: 20 }}>
            <Image style={styles.logo} source={require("../test.png")} />
            <Text style={{fontSize: 30, marginLeft: 80}}>
              firebase-chat test
              </Text>
            <Card>
              <FormLabel>Email</FormLabel>
              <FormInput 
                placeholder="Email address..." 
                onChangeText={this.handleChangeEmail}
              />
              <FormLabel>Password</FormLabel>
              <FormInput 
                secureTextEntry 
                placeholder="Password..." 
                onChangeText={this.handleChangePassword}
              />
    
              <Button
                buttonStyle={{ marginTop: 20 }}
                backgroundColor="#03A9F4"
                title="Log In"
                onPress={() => {
                  this.clickSignInCheck()
                }}
              />
              {/* <Button
                title="Not a user? Register here"
                onPress={() => {
                  this.props.navigation.navigate("Register")
                }}
              /> */}
            </Card>
          </View>
        );
      }

}

  const styles = StyleSheet.create({
    container: {
      flex: 1.2,
      //justifyContent: "flex-start",
      alignItems: "center",
      //backgroundColor: "#16a085",
      padding: 20,
      paddingTop: 30
    },
    logo: {
      width: 100,
      height: 100,
      marginLeft: 140
      
    },    
    logoContainer: {
      alignItems: "center",
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    formLabel: {
      marginLeft: 200
    }
  });
