import React, {
    Component,
    useState
} from 'react';
import '../App.css';
import {
    Button, Form, FormGroup, Label, Input, FormText, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import { ProfilePictureDropdown } from "./Home.jsx"


import {
    Link
} from 'react-router-dom'
import { get as _get, times } from "lodash";
import firebase from '../firebase.js';
import Meeting from './Meeting.jsx'
import { MdAddAlert } from 'react-icons/md';
import Home from './Home';


const theme1 = {
    header: {
        backgroundColor: '#222',
        color: '#fff',
    },
    body: {
        backgroundColor: '#333',
    },
    footer: {
        backgroundColor: '#222',
        color: '#ccc',
    },
    line: {
        backgroundColor: '#fff',
    },
    link: {
        color: '#fff',
    }
};



const dark = {
    backgroundColor: '#222',
    color: '#fff',
    line: {
        backgroundColor: '#fff',
    }
};
const classes = ["None", "English", "Biology"];

const db = firebase.firestore();

export default class Tutor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            requesting: false,
            subject: null,
            timesChecked: [],
            meetingsListSaved: [],




            timesS: ["12:00", "02:30", "03:30", "04:30", "05:30", "06:30"],
            timesE: ["01:00", "03:30", "04:30", "05:30", "06:30", "07:30"],
            errormessage: '',
            user: {
                auth: null,
                name: 'Anonymous',
            },


        }

        this.handleChange = this.handleChange.bind(this);
        this.submitHandler = this.submitHandler.bind(this);



        let checkedStart = []
        for (let i = 0; i < this.state.timesE.length; i++) {
            checkedStart.push(false)
        }
        this.setState({ timesChecked: checkedStart });



    }


    componentDidMount() {


        this.setState({ user: this.props.user });




        console.log("this.props.user " + this.props.user.auth)







        console.log('adding meetings')
        //working ish v
        // let tempErrTest = db.collection('meetings').doc('JnnvTgp4CNohTT5sI3uD').get().then(doc =>{
        //     console.log(doc.data().time)
        // })

        //temporary local meeting list
        let meetingsListReal = [];
        let meetingsList = [];
        //the meeting list of th edaabase
        if (this.state.user.auth) {
            firebase.firestore().collection('users').doc(this.state.user.auth.uid).collection('meetings').onSnapshot((querySnapshot) => {
                querySnapshot.docs.forEach((snap) => {

                    // console.log(snap.data())
                    let d = snap.data()
                    console.log('data from meetingslist')
                    console.log(d.time);
                    let m = new Meeting(d.uidOfRequest, d.time, d.day, d.tutorChosen, d.subject)
                    meetingsListReal.push(m)
                    //console.log(meetingsListReal)


                })
                console.log("meeting list real ========= " + meetingsListReal)
                this.setState({ meetingsListSaved: meetingsListReal })
                console.log("meetingListSaved = " + this.state.meetingsListSaved)

            })
            console.log("this.state.user.auth is not null")
        }





    }

    componentDidUpdate() {
        // this.setState({ user: this.props.user });



        //temporary local meeting list
        let meetingsListReal = [];
        if (this.state.user.auth) {
            this.state.user = this.props.user;
            firebase.firestore().collection('users').doc(this.state.user.auth.uid).collection('meetings').onSnapshot((querySnapshot) => {
                querySnapshot.docs.forEach((snap) => {

                    // console.log(snap.data())
                    let d = snap.data()
                    console.log('data from meetingslist')
                    console.log(d.time);
                    let m = new Meeting(d.uidOfRequest, d.time, d.day, d.tutorChosen, d.subject)
                    meetingsListReal.push(m)
                    //console.log(meetingsListReal)


                })
                console.log("meeting list real ========= " + meetingsListReal)
                this.setState({ meetingsListSaved: meetingsListReal })
                console.log("meetingListSaved = " + this.state.meetingsListSaved)

            })
            console.log("this.state.user.auth is not null")
        }
        else {
            this.setState()
            console.log("update didnt auth user")
        }
    }



    render() {
        if (!this.state.requesting) {
            return (
                <React.Fragment>


                    <Button id="requestHelp" onClick={this.updateRequesting}>Request meeting</Button >
                </React.Fragment>

            )

        }
        else {
            return (
                <React.Fragment>
                    {/* //title */}
                    <div id="titleArea2">



                        <h1 id="title">MVHW</h1>

                        <Link to="/" >Home</Link>
                        {
                            this.state.user.auth !== null ?
                                <ProfilePictureDropdown signout={this.signoutwithGoogle}><img src={this.state.user.auth.photoURL} alt={this.state.user.name} id="logOut" /></ProfilePictureDropdown>
                                :
                                <Button color='light' id="logIn" onClick={this.signinwithGoogle}>Sign In</Button>
                        }

                        {/* {
                        this.state.user.auth !== null ?
                            <ProfilePictureDropdown signout={this.signoutwithGoogle}><img src={this.state.user.auth.photoURL} alt={this.state.user.name} id="logOut" /></ProfilePictureDropdown>
                            :
                            <Button color='light' id="logIn" onClick={this.signinwithGoogle}>Sign In</Button>
                    } */}
                    </div>
                    <div id="general">
                        <div className="meetingForm">
                            <h1 className="specialTitle">Request Meeting</h1>
                            <hr className="whiteBar" />
                            <Label style={{ color: "white" }} for="select">Select the subject of the meeting</Label>



                            <br />

                            <Form onSubmit={this.handleSubmit}>
                                <Input type="select" name="select" style={{ outline: "none" }} id="tags" value={this.state.value} onChange={this.handleChange}>
                                    {this.createClassItems()}
                                </Input>
                                <br />
                                <br />
                                <p> Please select availability</p>
                                {this.giveTimes()}

                            </Form>

                            <Input type="submit" value="Submit" className="newBtn" style={{ margin: "auto" }} onClick={this.submitHandler} />


                        </div>









                        <div className="meetingForm">
                            <h1 className="specialTitle">Meetings</h1>
                            <hr className="whiteBar" />

                            {
                            }
                            {
                                this.state.meetingsListSaved.map(meeting => {

                                    return (
                                        <React.Fragment>
                                            <div className="questionBox">
                                                <h4>{"Meeting at " + meeting.getTime()}</h4>
                                                <h6>{"for " + meeting.getSubject()}</h6>
                                            </div>

                                        </React.Fragment>
                                    )
                                })
                            }
                        </div>
                    </div>
                </React.Fragment>
            )
        }
    }

    updateRequesting = () => {
        this.setState({ requesting: !this.state.requesting })
    }


    requestMeeting() {
        if (!this.state.requesting) {
            console.log("requesting help")
            return (
                <React.Fragment>

                    <Button id="requestHelp" onClick={this.setState({ requesting: true })}>Request meeting</Button >
                </React.Fragment>

            )

        }


    }


    handleChange(event, itemToChange) {
        this.setState({ itemToChange: event.target.value });
    }

    handleCheckChange(event, itemToChange, val) {
        // let currentState = this.state.itemToChange
        // let newArr = [];
        // for (let i = 0; i < currentState.length; i++) {

        // }

        // this.setState({ itemToChange: event.target.value });
    }


    giveTimes() {
        let list;

        let listList = [];
        for (let i = 0; i < this.state.timesS.length; i++) {
            let tempStr = this.state.timesS[i] + " - " + this.state.timesE[i];
            list = <React.Fragment>
                <div className="fixDiv">

                    <Input type='checkbox' name='check' value={this.state.timesChecked} onChange={this.handleCheckChange("timesChecked", i)} />

                    <Label for='check'>{tempStr.toString()}</Label>
                </div>
            </React.Fragment>;
            listList.push(list)

        }
        return listList;
    }
    createClassItems() {
        let items = [];
        for (let i = 0; i < (classes.length); i++) {
            items.push(<option key={i}>{classes[i]}</option>);
        }
        return items;
    }
    //stolen from Home.jsx
    submitHandler = (event) => {
        event.preventDefault();
        // let val = event.target["text"].value;
        // let t = event.target["select"].value;
        // DO NOT DELETE BELOW -----------------------------
        // if (val === "") {
        //     let err = <FormText color="danger">You must fill in all fields</FormText>;
        //     this.setState({ errormessage: err });
        // } 

        //     let date = (new Date()).toString();
        //     let name = "";
        //     if (anonymous === true) {
        //         name = "Anonymous";
        //     } else {
        //         name = this.state.user.name;
        //     }

        // }
        //--------------------------------------

        //sending an email
        //this.sendEmail('template_Zxp8BP9K', {
        //from_name: this.state.user.name, 
        //to_name: "AVID Tutors", 
        //message_html: `Hello, I'm struggling with ${this.state.value}, and am available to have a tutoring session from ${this.state.}`
        //})
        console.log(this.state.timesChecked)

        //adding to database
        //temporary code befor ethe user stuff gets fixed dont delete
        //replace specific id with user id later
        db.collection('users').doc(this.state.user.uid).collection('meetings').add({
            uidOfRequest: null, //user who requested it
            time: 8, //time of day of meeting
            day: null, //day chosen
            tutorChosen: null, //wthich tutor they chose null if none ye
            subject: null //the subject they chose



        })
        //test




        // [0].doc('time').data


        //                      |
        //for updating the page v
        this.setState({ update: 0 });
        // event.target["text"].value = "";
        console.log("tried to submit")
    }

    sendEmail(templateID, variables) {
        window.emailjs.send(
            'gmail', templateID,
            variables
        ).then(res => {
            console.log('Email successfully sent!')
        })
            // Handle errors here however you like, or use a React error boundary
            .catch(err => console.error('Oh well, you failed. Here some thoughts on the error that occured:', err))
    }


    getMeetings = async () => {
        console.log('adding meetings')
        //working ish v
        // let tempErrTest = db.collection('meetings').doc('JnnvTgp4CNohTT5sI3uD').get().then(doc =>{
        //     console.log(doc.data().time)
        // })

        //temporary local meeting list
        let meetingsListReal = [];
        let meetingsList = [];
        //the meeting list of th edaabase

        await firebase.firestore().collection('users').doc(this.state.user.uid).collection('meetings').onSnapshot((querySnapshot) => {
            querySnapshot.docs.forEach((snap) => {

                // console.log(snap.data())
                let d = snap.data()
                console.log('data from meetingslist')
                console.log(d.time);
                let m = new Meeting(d.uidOfRequest, d.time, d.day, d.tutorChosen, d.subject)
                meetingsListReal.push(m)
                //console.log(meetingsListReal)


            })
            console.log("meeting list real ========= " + meetingsListReal)
            return meetingsListReal
        })


        // //copying over code 
        // meetingsList.forEach((snap) => {

        //     // console.log(snap.data())
        //     let d = snap.data()
        //     console.log('data from meetingslist')
        //     console.log(d.time);
        //     let m = new Meeting(d.uidOfRequest, d.time, d.day, d.tutorChosen, d.subject)
        //     meetingsListReal.push(m)
        //     //console.log(meetingsListReal)


        // })
    }
    async renderMeetings() {

        let mLR = await this.getMeetings();
        console.log('length0 = ' + mLR.length);
        console.log();

        let t = this.renderMeetings2(mLR);

        return t;
    }
    renderMeetings2(meetingsListReal) {
        let mLR = meetingsListReal
        let list;
        let listList = [];
        console.log('length = ' + mLR.length)
        console.log(mLR)
        for (let i = 0; i < mLR.length; i++) {
            list = (
                <React.Fragment>
                    <div className="questionBox">
                        <h4>Meeting at  + {mLR[i].getTime()}</h4>
                        <h2>for +  {mLR[i].getSubject()}</h2>
                    </div>

                </React.Fragment>
            );


            listList.push(list)
        }

        console.log('listlist' + listList)


        return listList

    }



}