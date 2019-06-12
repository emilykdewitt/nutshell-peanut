import firebase from 'firebase/app';
import 'firebase/auth';
import './messages.scss';

import util from '../../helpers/util';
import messagesData from '../../helpers/data/messagesData';
import usersData from '../../helpers/data/usersData';
import smash from '../../helpers/smash';

const moment = require('moment');

const scrollPosition = () => {
  console.error('scrollHeight function not working');
  // const element = document.getElementById('messageBoard');
  // element.scrollTop = element.scrollHeight;
};

const addMessage = (e) => {
  e.preventDefault();
  const currentTime = moment().toISOString();
  const newMessage = {
    uid: firebase.auth().currentUser.uid,
    message: document.getElementById('messageInputField').value,
    timestamp: currentTime,
  };
  messagesData.addMessageToDatabase(newMessage)
    .then(() => {
      document.getElementById('messageInputField').value = '';
      // eslint-disable-next-line no-use-before-define
      getMessages();
    })
    .catch(err => console.error('no new message added', err));
  scrollPosition();
};

const listenForEnter = (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    document.getElementById('messageSubmitBtn').click();
  }
};

const editMessage = (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.error(e.target.id);
};

const addEvents = () => {
  // The code below is not working for hiding and showing timestamps!
  // const timestamps = document.getElementsByClassName('full-message-div');
  // const timestampsArray = Array.from(timestamps);
  // timestampsArray.forEach((timestamp) => {
  //   timestamp.addEventListener('mouseover', timestamp.classList.remove('hide'));
  // });
  const messageEditBtns = Array.from(document.getElementsByClassName('editMessageBtn'));
  messageEditBtns.forEach((button) => {
    button.addEventListener('click', editMessage);
  });
  document.getElementById('messageSubmitBtn').addEventListener('click', addMessage);
  document.getElementById('messageInputField').addEventListener('keyup', listenForEnter);
};

const messagesBuilder = (messagesArray) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const currentUserId = firebase.auth().currentUser.uid;
      const messagesToSort = messagesArray;
      messagesToSort.sort((a, b) => {
        // eslint-disable-next-line no-param-reassign
        a = new Date(a.timestamp);
        // eslint-disable-next-line no-param-reassign
        b = new Date(b.timestamp);
        // eslint-disable-next-line no-nested-ternary
        return a < b ? -1 : a > b ? 1 : 0;
      });
      let userType = '';
      let domString = '';
      domString += '<div id="messageBoard">';
      messagesToSort.forEach((message) => {
        const timeToDisplay = moment(message.timestamp).format('dddd, MMMM Do YYYY, h:mm a');
        if (message.uid === currentUserId) {
          userType = 'from-me';
        } else {
          userType = 'from-them';
        }
        domString += `<div class="col-12 text-center ${userType}-message">`;
        domString += `<div class="full-message-div" id="${message.id}">`;
        domString += `<p class="userName">${message.userName}</p>`;
        domString += `<p class="message ${userType}">${message.message}</p>`;
        domString += `<p class="timestamp">${timeToDisplay}</p>`;
        if (message.uid === currentUserId) {
          domString += `<button id="${message.id}" class="editMessageBtn">Edit</button>`;
        }
        domString += '</div>';
        domString += '</div>';
      });
      domString += '</div>';
      domString += '<div id="messageInputDiv">';
      domString += '<div class="col-12 text-center">';
      domString += '<input id="messageInputField" type="text" placeholder="Type message here"></input>';
      domString += '<button id="messageSubmitBtn" class="btn btn-primary">Submit</button>';
      domString += '</div>';
      domString += '</div>';
      util.printToDom('messages-page', domString);
      addEvents();
    } else {
      console.error('not logged in');
    }
  });
  scrollPosition();
};

const getMessages = () => {
  messagesData.getMessages()
    .then((messages) => {
      usersData.getUsers()
        .then((users) => {
          const finalMessages = smash.messagesWithUserInfo(messages, users);
          messagesBuilder(finalMessages);
        });
    });
};

export default { getMessages };
