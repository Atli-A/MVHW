import React, {
    Component,
    useState
} from 'react';
import '../App.css';
import { Row, Col, Form, FormGroup, Label, Input, Badge, UncontrolledPopover, PopoverBody, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import {
    Link
} from 'react-router-dom'
import firebase from '../firebase.js';
import { get as _get } from "lodash";
import Question from '../Question';
import {translate} from "../util.js"

// the start of cleaning up the firestore pull from database
// const db = firebase.firestore()

const Votes = (props) => {
    let id = "vote-num-" + props.listvalue;
    return (
        <div>
            <h5 id={id} className="upvotes-num">{props.num}</h5>
            <UncontrolledPopover trigger="legacy" placement="bottom" target={id}>
                <PopoverBody>
                    {props.actualNumber}
                </PopoverBody>
            </UncontrolledPopover>
        </div>
    );
}


const deleteAccount = (toggle) => {
    let posts = [];
    firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).collection("posts").get().then(querySnapshot => {
        querySnapshot.docs.forEach(post => {
            posts.push(post.data().original);
            firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).collection("posts").doc(post.id).delete();
        })
        return posts
    }).then(posts => {
        posts.forEach(post => {
            firebase.firestore().collection("questions").doc(post).collection("replies").get().then(querySnapshot => {
                querySnapshot.docs.forEach(reply => {
                    firebase.firestore().collection("questions").doc(post).collection("replies").doc(reply.id).delete();
                })
            }).then(() => {
                firebase.firestore().collection("questions").doc(post).delete();
            })
        })
    })
    firebase.auth().currentUser.delete().then(() => {
        toggle()
    }).catch(err => {
        console.error("Error: ", err)
    })
}


const DeleteModal = (props) => {
    const {
        className,
        language
    } = props;

    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);

    return (
        <div>
            <Button color="danger" outline onClick={toggle}>{translate(language, "deleteAccount")}</Button>
            <Modal returnFocusAfterClose={false} isOpen={modal} toggle={toggle} className={className}>
                <ModalHeader toggle={toggle}>{translate(language, "deleteAccount")}</ModalHeader>
                <ModalBody>
                    <p>{translate(language, "deleteWarning")}</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>{translate(language, "cancel")}</Button>
                    <Button color="danger" onClick={() => deleteAccount(toggle)}>{translate(language, "confirm")}</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}


const dark = {
    backgroundColor: '#222',
    color: '#fff',
    line: {
        backgroundColor: '#fff',
    }
};

export default class Profile extends Component {
    constructor(props) {
        super(props)
        this.classes = ["Math", "Geometry", "Algebra", "Trigonometry", "Calculus", "Science", "Biology", "Chemistry", "Physics", "English", "Survey", "AP Comp", "History", "World Studies", "AP Euro", "WHAP", "USHAP", "Spanish", "Anime", "Chinese", "Computer Science", "Art", "Music"];
        this.state = {
            selected: [],
            user: {
                auth: null,
                name: "Anonymous",
            },
            isTutor: false,
            userClasses: [],
            posts: [],
        }
        this.handleInputChange = this.handleInputChange.bind(this);


    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({ user: { auth: user, name: user.displayName } })
                firebase.firestore().collection("users").doc(user.uid).get().then(doc => {
                    this.setState({ userClasses: doc.data().classes });
                    if (doc.data().isTutor === true) {
                        this.setState({ isTutor: true });

                    }

                })
                //console.log(this.state.user.auth)
                firebase.firestore().collection("users").get().then(querySnapshot => {
                    let raw = querySnapshot.docs;
                    let userdata = null;
                    raw.forEach(doc => {
                        if (doc.id === this.state.user.auth.uid) {
                            userdata = doc.data().classes;
                            // userdata.forEach(item => {
                            //     this.state.selected.push(item)
                            // })
                            if (userdata !== undefined) {
                                this.setState({ selected: userdata });
                            }
                        }
                    })
                    // console.log(userdata[0].data())
                    // console.log(doc.data().classes)
                })


                firebase.firestore().collection("users").doc(this.state.user.auth.uid).collection("posts")
                    .onSnapshot((querySnapshot) => {
                        let docs = this.state.posts;
                        querySnapshot.docChanges().forEach(change => {
                            if (change.type === 'added') {
                                let doc = change.doc;
                                let id = doc.data().original;

                                firebase.firestore().collection("questions").doc(id).get().then(doc => {
                                    let raw = doc.data();
                                    let ups, downs, votes = 0;
                                    if (raw) {
                                        if (doc.data().usersUpvoted.length > 0 && doc.data().usersDownvoted.length > 0) {
                                            ups = doc.data().usersUpvoted.length
                                            downs = doc.data().usersDownvoted.length
                                            votes = ups - downs;
                                        } else if (doc.data().usersUpvoted.length > 0) {
                                            ups = doc.data().usersUpvoted.length
                                            votes = ups;
                                        } else if (doc.data().usersDownvoted.length > 0) {
                                            downs = doc.data().usersDownvoted.length
                                            votes = 0 - downs;
                                        }
                                        docs.push(new Question(raw.title, JSON.parse(raw.auth), raw.timestamp, doc.id, votes, raw.tags, raw.img_url, raw.username));
                                        this.setState({ posts: docs })
                                    }
                                })
                            } else if (change.type === 'removed') {
                                let doc = change.doc;
                                for (var i = 0; i < docs.length; i++) {
                                    if (docs[i].getId() === doc.id) {
                                        docs.splice(i, 1);
                                    }
                                }
                                this.setState({ posts: docs })
                            }
                        })
                    })

            } else {
                this.setState({ user: { auth: user, name: 'Anonymous' } })
            }
        });
    }

    componentWillUnmount() {

    }

    handleInputChange(event) {
        const target = event.target;

        if (target.checked && !(this.state.selected.includes(target.name))) {
            this.state.selected.push(target.name);
            target.value = true;
        } else {
            const index = this.state.selected.indexOf(target.name);
            if (index > -1) {
                this.state.selected.splice(index, 1);
            }
            target.value = false;
        }

        this.setState({ update: 1 });
        this.submitHandler(event);
    }

    submitHandler = (event) => {
        event.preventDefault();

        firebase.firestore().collection("users").doc(this.state.user.auth.uid).update({
            classes: this.state.selected,
        });
        firebase.firestore().collection("users").doc(this.state.user.auth.uid).get().then(doc => {
            this.setState({ userClasses: doc.data().classes });
        })
        this.setState({ update: 0 });
    }

    deleteQ = (item) => {

        this.setState({ focus: -1 });
        let replies = [];

        firebase.firestore().collection("questions").doc(item.getId()).collection("replies").get().then(querySnapshot => {
            querySnapshot.docs.forEach(doc => {
                replies.push(doc.id);
            })
            return replies;
        }).then(replies => {
            replies.forEach(id => {
                firebase.firestore().collection("questions").doc(item.getId()).collection("replies").doc(id).delete().then(doc => {
                    console.log("Successfully deleted reply with id: ", id);
                })
            })
        }).then(() => {
            firebase.firestore().collection("users").doc(this.state.user.auth.uid).collection("posts").get().then(querySnapshot => {
                querySnapshot.docs.forEach(doc => {
                    replies.push(doc.id);
                })
                return replies;
            }).then(replies => {
                replies.forEach(id => {
                    firebase.firestore().collection("users").doc(this.state.user.auth.uid).collection("posts").doc(id).delete().then(doc => {
                        console.log("Successfully deleted reply with id: ", id);
                    })
                })
            }).catch((error) => {
                console.error("Error removing document: ", error);
            })
        });
    }

    render() {
        return (
            <React.Fragment>
                <div >
                    <div id="checkBoxSelect">

                        <Link to="/">{translate(this.props.language, "home")}</Link>
                        <br/>
                        <Link to="/teacher-sign-in">{translate(this.props.language, "teacher")}</Link>
                        
                        
                        
                        <h1 id="pfp-title">{translate(this.props.language, "profile")}</h1>

                        <center>
                            <img src={_get(this.state.user.auth, "photoURL", "https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png")} alt="pfp" className="pfp" />
                        </center>
                        <div>
                            {
                                this.state.isTutor !== true ?
                                    <div></div>
                                    :
                                    <center><h2><Badge color="success">You are verified as an AVID tutor!</Badge></h2></center>

                            }

                        </div>

                        <hr style={dark.line} />

                        {
                            this.state.userClasses ?
                                <div id="checkBoxTitle">
                                    <h1 className="pf-title">Select Classes: <span className="badge"> {this.state.selected.length + 0}</span></h1>
                                    <br />
                                </div>
                                :
                                null

                        }


                        <Form onSubmit={this.submitHandler} >
                            <FormGroup check>
                                {
                                    //console.log(this.state.userClasses)
                                }
                                {
                                    this.classes.map((cless, key) => {
                                        return (
                                            <div key={key} className="tickBoxSurround">
                                                <Label for={cless} >
                                                    {
                                                        this.state.userClasses ?
                                                            <Input onChange={this.handleInputChange} className="tickboxes" id={cless} name={cless} type="checkbox" checked={this.state.userClasses.indexOf(cless) > -1} />
                                                            :
                                                            <Input onChange={this.handleInputChange} className="tickboxes" id={cless} name={cless} type="checkbox" />
                                                    }
                                                    {cless}
                                                </Label>
                                                <br />
                                            </div>
                                        );
                                    })
                                }
                            </FormGroup>

                            {/* <Button color="info" id="submitClasses">Save Classes</Button> */}
                        </Form>

                        <hr style={dark.line} />

                        <div className="posts">
                            <h1 className="pf-title">{translate(this.props.language, "yourPosts")}</h1>
                            <ul className="list-posts">

                                {

                                    this.state.posts.map((item, i) => {
                                        let user = <h5>User: <Badge color="secondary">you</Badge></h5>;

                                        let color = '';
                                        switch (item.getTags()) {
                                            case 'Math':
                                                color = 'info';
                                                break;
                                            case 'Science':
                                                color = 'warning';
                                                break;
                                            case 'English':
                                                color = 'danger';
                                                break;
                                            case 'History':
                                                color = 'success';
                                                break;
                                            case 'Computer Science':
                                                color = 'primary';
                                                break;

                                            default:
                                                color = 'secondary';
                                                break;
                                        }
                                        let tag = <Badge color={color}>{item.getTags()}</Badge>;
                                        if (item.getTags() === "None") {
                                            tag = null;
                                        }

                                        let upvotes = item.getUpvotes() + "";

                                        if (item.getUpvotes() >= 1000) {
                                            upvotes = ((item.getUpvotes() / 1000)).toFixed(1) + "k";
                                        }

                                        let deletedata = null;
                                        if (this.state.user.auth) {
                                            if (this.state.user.auth.uid === item.getUser().uid) {
                                                deletedata = (
                                                    <span className="links" onClick={() => this.deleteQ(item)}>delete</span>
                                                );
                                            }
                                        }

                                        return (
                                            <li key={i} style={dark} className="pf-questionBox">
                                                <Row>
                                                    <Col xs="1" className="updown">
                                                        <Votes num={upvotes} actualNumber={item.getUpvotes()} listvalue={i} />
                                                    </Col>
                                                    <Col xs="11">
                                                        <div style={dark}>
                                                            {user}
                                                            <h4>Question: {item.getText()}  {tag}</h4>
                                                            {
                                                                item.getImgUrl() !== "" ?
                                                                    <img src={item.getImgUrl()} alt={item.getImgUrl()} className="post-img" />
                                                                    :
                                                                    null
                                                            }
                                                        </div>
                                                        <hr style={dark.line} />
                                                        {deletedata}
                                                    </Col>
                                                </Row>
                                            </li>

                                        );
                                    })
                                }
                            </ul>
                            <hr style={dark.line} />
                            <center>
                                <h1>{translate(this.props.language, "dangerZone")}</h1>
                                <DeleteModal language={this.props.language}/>
                                <h1>Terms & Conditions</h1>
                            </center>
                            <p>Welcome to Mountain View Homework hub or MVHW as it is commonly known. There are rules that must all be followed in order to participate in this environment. These rules must be followed:</p>
                            <ol>
                                <li>No cheating and sharing answers</li>
                                <ol>
                                    <li>We can track who posted what even if you post “anonymously”</li>
                                    <li>Replies need to be more than just the answer. If you respond with the answer itself, you are sharing answers</li>
                                </ol>
                                <li>No profanity of any kind</li>
                                <li>No bullying or harassment of any kind</li>
                                <li>No NSFW content will be tolerated.</li>
                            </ol>
                            <p>Breaking any of the following rules will result in deletion of the post deletion, possible account deletion/ban, and even the possibility of getting in trouble with the school administration.</p>
                            <hr style={dark.line} />
                            <center>
                                <h1>Danger Zone</h1>
                                <DeleteModal></DeleteModal>
                            </center>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}