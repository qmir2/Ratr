import React from 'react';
import {View, Button, Text, ScrollView, StyleSheet, Switch, SafeAreaView, 
        StatusBar, Image, ImageBackground, FlatList, TouchableOpacity} from 'react-native'
import Constants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption,} from 'react-native-popup-menu';
import {Picker} from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';

import firebase from 'firebase'
require('firebase/auth')

export default class BookmarkScreen extends React.Component {
  _isMounted = false;

  constructor() {
    super()
    this.state = {
      lists: [],
      loggedOut: false,
      user: [],
      myListData: [], userData: [],
      progress: 'Bookmark',
      uniqueValue: 1
    }
  }

  // gets the data from the django backend
  fetchDataFromApi = () => {
    const url = "http://192.168.1.74:8000/api/list/";
    fetch(url).then(res => res.json())
    .then(res => {
      this.setState({myListData: res})
    })
    .catch(error => {
      console.log(error)
    })
  };

  // when component mounts, it will check for focus on myList and call the API
  componentDidMount(){
    this._isMounted = true;
    // listens for when the tab is selected as MyList
    this.focusListener = this.props.navigation.addListener("focus", () => {      
      firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
          console.log('user is logged out')
          this.setState({loggedOut: true, user: null})
        }
        else{
          console.log('user is logged in ', user.email)
          this.fetchDataFromApi()
          this.setState({user: user, loggedOut: false, progress: 'Bookmark'})
        }
      });
    });
  }
  
  // unmounts the component to avoid any leaks
  componentWillUnmount() {
    this._isMounted = false;
    this.setState = (state,callback)=>{
      return;
    };
  }

  // helps to refresh the screen
  forceRemount = () => {
    this.setState(({ uniqueValue }) => ({
      uniqueValue: uniqueValue + 1
    }))
  }

  // when item in the picker is selected it will naviagte 
  itemSelected = (item) => {
    if (item.value === 'In-Progress'){
      this.forceRemount()
      this.props.navigation.navigate('InProgress')
    }
    if (item.value === 'Completed'){
      this.forceRemount()
      this.props.navigation.navigate('Completed')
    }
  }

  render() {
    const dotsIcon = <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />

    // gets only the data that belongs to the current user that is logged in
    var userData = this.state.user !== null ? this.state.myListData.filter(x => (x.email === this.state.user.email) && (x.user_progress === 'Read Later')) : null;

    return (
      this.state.loggedOut === true ? 
      <SafeAreaView style={styles.droidSafeArea}>
        <View style={styles.container}>
          <Text style={styles.textStyle}>Login in first to access your list</Text>
        </View>
      </SafeAreaView>
      :
      <SafeAreaView style={styles.droidSafeArea}>
        {/* <ScrollView style={styles.container}> */}
          <View style={styles.container} key={this.state.uniqueValue}>
            <DropDownPicker
                items={[
                    {label: 'Bookmark', value: 'Bookmark'},
                    {label: 'Completed', value: 'Completed'},
                    {label: 'In-Progress', value: 'In-Progress'},
                ]}
                defaultValue={this.state.progress}
                containerStyle={{ height: 40 }}
                style={{ backgroundColor: '#fafafa' }}
                itemStyle={{ justifyContent: 'flex-start' }}
                dropDownStyle={{backgroundColor: '#fafafa'}}
                onChangeItem={item => this.itemSelected(item)}
            />
            <MenuProvider style={styles.container}>
              <FlatList
                data={userData}
                columnWrapperStyle={{flex: 1, justifyContent: "space-around"}}
                numColumns={2}
                renderItem={({ item }) => (
                  <View style={{marginBottom: 10, marginRight: 10}}>
                    <ImageBackground source={{ uri:item.book_url }}
                        style={{ width: 140, height: 220, position: 'relative', top: 0, left: 0 }} >
                        {item.user_rating !== 'N/A' ? 
                          <Text style={styles.overlayRatingText} >
                            {item.user_rating}/5
                          </Text> : 
                          <Text style={styles.overlayRatingText} >
                            -/5
                          </Text>
                        }
                    </ImageBackground>

                    <View style={{flexDirection: 'row', width: 140, height: 35, backgroundColor: 'tomato', justifyContent: 'center', alignItems: 'center'}}>
                      {item.book_name.length <= 30 ? 
                      <Text style={styles.textStyle}>{item.book_name}</Text> : 
                      <Text style={styles.textStyle}>{item.book_name.substring(0,27)}...</Text> 
                      }
                      <Menu>
                        <MenuTrigger>
                          {dotsIcon}
                        </MenuTrigger>
                        <MenuOptions>
                          <MenuOption onSelect={() => alert(`Save`)} text='Save' />
                          <MenuOption onSelect={() => alert(`Delete`)} text='Delete' />
                          <MenuOption onSelect={() => alert(`Not called`)} disabled={true} text='Disabled' />
                        </MenuOptions>
                        
                      </Menu>
                    </View>
                  </View> 
                )}
                keyExtractor={item => item.book_name}
              />
            </MenuProvider>
          </View>
        {/* </ScrollView> */}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1b1c',
    paddingHorizontal: 15, paddingTop: 9,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appContainer: {
    paddingTop: Constants.statusBarHeight
  },
  droidSafeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? 'gray' : '#1b1b1c',
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    width: 120,
    textAlign: 'center'
  },
  image: {
    width: 140, height: 200, resizeMode: 'stretch'
  },
  overlayRatingText: {
    backgroundColor: 'rgba(52, 52, 52, 0.7)', fontWeight: 'bold', color: 'white', 
    position: 'absolute', top: 0, right: 0, fontSize: 22
  }
})