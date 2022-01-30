import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:""
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }



  addRequest =(bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
    })

    this.setState({
        bookName :'',
        reasonToRequest : ''
    })

    return Alert.alert("Book Requested Successfully")
  }



  handleBookRequest =async (bookName,reasonToRequest)=>{
  
    var{userId}=this.state
    var randomRequestId = this.getUniqueId();
    
    
    if (bookName && reasonToRequest){
      db.collection("requested_books").add({
        user_id: userId,
        book_name: bookName,
        reason_to_request: reasonToRequest,
        request_id: randomRequestId,
        book_status: "requested",
        date: firebase.firestore.FieldValue.serverTimeStamp()
      });

      await this.getRequestedBooks();
        db.collection("users").where("email_id","==", userId)
        .get()
        .then((snapshot)=>{
          snapshot.forEach( (doc)=>{
            db.collection("users")
            .doc(doc.id)
            .update({
              is_book_request_active: true
            });
          });
        })

      this.setState({
        bookName:"",
        reasonToRequest:"",
        randomRequestId: ""
        
      });
      Alert.alert(" book requested successfully")
    }
    else {
      Alert.alert(" fill details properly")
    }
      

    }

    getRequestedBooks= async()=>{

      const {userId}= this.state
      db.collection("requested_books")
      .where("user_Id", "==", userId)
      .get()
      .then((snapshot)=>{
        snapshot.docs.map((doc)=>{
          const details = doc.data();
          if (details.book_status !==  "recieved" ){
              this.setState({
                requestId:details.request_id,
                requestedBookName: details.book_name,
                bookStatus: details.book_status,
                docId: doc.id,
                
              })

          }
        })
      })
    }

    getActiveBookRequest= async ()=>{
      const {userId} = this.state
     db.collection("users")
     .where("email_id" , "==", userId)
     .onSnapshot((snapshot)=>{
       snapshot.docs.map((doc)=>{

        const details = doc.data();
        this.setState({
          isBookRequestActive: details.is_book_request_active,
          userDocId: docId
        })
       })
     })

    }

  



  render(){
    return(
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter book name"}
                onChangeText={(text)=>{
                    this.setState({
                        bookName:text
                    })
                }}
                value={this.state.bookName}
              />
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the book"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    )
  }
}



  /*
  only one request a time

  the field for all users: is_book_request_active 
  this field will have a boolean value (false by default)
  it will change to true after a book has been requested
  after the request is accepted/ book is received the field will change to false again
  once field changes to false a new request can be initiated

*/


const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)

  /*
  only one request a time

  the field for all users: is_book_request_active 
  this field will have a boolean value (false by default)
  it will change to true after a book has been requested
  after the request is accepted/ book is received the field will change to false again
  once field changes to false a new request can be initiated

*/

