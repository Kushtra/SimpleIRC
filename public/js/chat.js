const socket = io();

//Elements
const $messageForm = document.querySelector('#sendMsg');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const linkTemplate = document.querySelector('#linkTemplate').innerHTML;
const sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrollOffset) $messages.scrollTop = $messages.scrollHeight;
}

socket.on('newLinkMsg', (message) => {
  const html = Mustache.render(linkTemplate, {
    link: message.url,
    createdAt: moment(message.createdAt).format("H:m"),
    username: message.username
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('newMsg', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("H:m"), //for date add: Do MMM-
    username: message.username
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if(e.target.elements.message.value.trim() === '') return;
  $messageFormButton.setAttribute('disabled', 'disabled');
  socket.emit('sendMsg', e.target.elements.message.value, () => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    console.log('Message was delivered!');
  });
});

$locationButton.addEventListener('click', () => {
  $locationButton.setAttribute('disabled', 'disabled');
  if(!navigator.geolocation) return alert('Geolocation is not supported by your browser!');
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', position.coords.latitude, position.coords.longitude, (error) => {
      $locationButton.removeAttribute('disabled');
      console.log('Location sent successfuly!');
    });
  });
});

socket.on('updateUsers', (room, allUsers) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    allUsers
  });
  document.querySelector('#sidebar').innerHTML = html;
});

socket.emit('join', {username, room}, (error) => {
  if(error) {
    alert(error);
    location.href = '/';
  }
});
