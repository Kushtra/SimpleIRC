const users = [];

const addUser = (id, username, room) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if(!username || !room){
    return {
      error: 'Username and room are required!'
    }
  }

  const existing = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if(existing) return {
    error: 'Username is already taken!'
  }

  const user = {
    id,
    username,
    room
  }
  users.push(user);
  return { user };
}

const removeUser = (id) => {
  for(let i=0;i<users.length;i++){
    if(id === users[i].id) return users.splice(i, 1)[0];
  }
}

const getUser = (id) => {
  return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
