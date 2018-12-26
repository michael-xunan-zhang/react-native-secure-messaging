import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  StatusBar,
  TouchableHighlight,
  Image,
  KeyboardAvoidingView,
  AsyncStorage,
  Alert
} from "react-native";

import {
    StackNavigator,
    TabNavigator,
    SwitchNavigator
 } from "react-navigation";

import firebase from "firebase";
require('firebase/messaging');


var Token = '';

class Register extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          email: "",
          name: "",
          uid: "",
          password: "",
          password_confirmation: "",
          errorMessage: null,
          loading: false
        };
        // firebase
        //   .messaging()
        //   .getToken()
        //   .then(token => {
        //     console.warn("Device firebase Token: ", token);
        //     Token = token;
        //   });
    }

    getRef() {
        return firebase.database().ref();
    }
    
    clickRegisterCheck = () => {
      console.log('clickRegisterCheck...');
    //   if (this.state.email == '' || this.state.password == '' 
    //         || this.state.password_confirmation == '') {
    //     Alert.alert("Email or password cannot be blank!");
    //     return;
    //   }
    //   else if (this.state.password != this.state.password_confirmation) {
    //     Alert.alert('Password confirmation different from your password!');
    //   }
    //   else {
    //     this.firebaseRegister();
    //     //this.props.navigation.navigate("Main");
    //   }
      if (this.state.email == "") {
        Alert.alert("Email cannot be blank")
      }
      else if (this.state.password == "") {
        Alert.alert("Password cannot be blank")
      }
      else if (this.state.name == "") {
        Alert.alert("Name cannot be blank")
      }
      else {
        this.firebaseRegister();
        Alert.alert("Please log in")
        this.props.navigation.navigate("Login");
      }
    }

    async firebaseRegister() {
        console.log("firebase Register function..")
        this.setState({ errorMessage: null, loading: true })
        const { email, password, name } = this.state;
        console.log(email)
        console.log(password)
        console.log(name)

        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                firebase.auth().onAuthStateChanged(user => {
                    if (user) {
                        console.log("after just created an user, check user info:")
                        console.log(user.uid)
                        console.log(user.name)
                        console.log(user.email)
                        firebase.database().ref("user/"+user.uid).set({
                            email: this.state.email,
                            uid: user.uid,
                            name: this.state.name
                          })   
                        this.setState({ loading: false })
                    }
                })
                // var currUser = firebase.auth().currentUser;
                // console.log("what about current user?")
                // console.log(currUser.uid)
                // console.log(currUser.name)
                // console.log(currUser.email)
                // //this.setState({ loading: false })
            })
            .catch(error => {
                var msg = error.message;
                this.setState({ errorMessage: msg, loading: false })
            })


        // firebase.auth().onAuthStateChanged(user => {
        //     if (user) {
        //       //console.log(user.uid, user.email, user.name);
        //     //   console.log(user.uid, user.email, user.name);
        //     //   user.email = this.state.email;
        //     //   user.displayName = this.state.name;
        //     //   console.log("user.displayName: " + user.displayName);
        //     //   console.log(user.uid, user.email, user.name);
        //     //   this.getRef()
        //     //     .child("users")
        //     //     .push({
        //     //       email: email,
        //     //       //uid: user.uid,
        //     //       uid: user.uid,
        //     //       name: this.state.name,
        //     //       token: Token
        //     //     });
              
        //       firebase.database().ref("user/"+user.uid).set({
        //         email: this.state.email,
        //         name: this.state.name
        //       })   
        //       console.log("how many times???") 
        //         //this.props.navigation.navigate("Boiler");
        //       this.setState({
        //         loading: false
        //       });
        //     }
        // });


    }


    // static navigationOptions = ({ navigation }) => ({
    //     title: 'Register',
    //   });

    render() {
      return (
        // <View style={styles.container}>
        //   <Text style={styles.paragraph}>
        //     Change code in the editor and watch it change on your phone! Save to get a shareable url.
        //   </Text>
        // </View>
        <View behavior="padding" style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#16a085" />
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={require("../test.png")} />
          <Text style={styles.subtext}>Sign Up:</Text>
        </View>
        <KeyboardAvoidingView>
          <TextInput
            value={this.state.name}
            onChangeText={name => this.setState({ name })}
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="rgba(255,255,255,0.7)"
            returnKeyType="next"
            onSubmitEditing={() => this.emailInput.focus()}
          />
          <TextInput
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.7)"
            returnKeyType="next"
            ref={input => (this.emailInput = input)}
            //onSubmitEditing={() => this.passwordCInput.focus()}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Email"
          />
          <TextInput
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="rgba(255,255,255,0.7)"
            ref={input => (this.passwordCInput = input)}
            //onSubmitEditing={() => this.passwordInput.focus()}
            returnKeyType="next"
            secureTextEntry
          />
          <TextInput
            value={this.state.password}
            onChangeText={password_confirmation =>
              this.setState({ password_confirmation })
            }
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={true}
            placeholderTextColor="rgba(255,255,255,0.7)"
            returnKeyType="go"
            secureTextEntry
            ref={input => (this.passwordInput = input)}
          />
        </KeyboardAvoidingView>
        <TouchableHighlight
          //onPress={this.onRegisterPress.bind(this)}
          onPress={() => {
            this.clickRegisterCheck()
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableHighlight>
        {/* {this.renderErrorMessage()} */}
        {/* <Spinner visible={this.state.loading} /> */}
      </View>
      );
    }
  }
  
//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingTop: Constants.statusBarHeight,
//       backgroundColor: '#ecf0f1',
//     },
//     paragraph: {
//       margin: 24,
//       fontSize: 18,
//       fontWeight: 'bold',
//       textAlign: 'center',
//       color: '#34495e',
//     },
//   });

  const styles = StyleSheet.create({
    container: {
      flex: 1.2,
      justifyContent: "flex-start",
      alignItems: "center",
      //backgroundColor: "#16a085",
      backgroundColor: "blue",
      padding: 20,
      paddingTop: 100
    },
    logoContainer: {
      alignItems: "center",
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    logo: {
      width: 200,
      height: 200
    },
    input: {
      height: 40,
      width: 350,
      marginBottom: 10,
      backgroundColor: "rgba(255,255,255,0.2)",
      color: "#fff",
      paddingHorizontal: 10
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
    buttonText: {
      fontSize: 18,
      alignSelf: "center",
      textAlign: "center",
      color: "#FFF",
      fontWeight: "700"
    },
    subtext: {
      color: "#ffffff",
      width: 160,
      textAlign: "center",
      fontSize: 35,
      fontWeight: "bold",
      marginTop: 20
    },
    error: {
      margin: 8,
      marginBottom: 0,
      color: "red",
      textAlign: "center"
    }
  });

  export default Register;