const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username can not empty"
    };
  }

  const existUser = users.find(user => {
    return user.username === username && user.room === room;
  });

  if (existUser) {
    return {
      error: "user existed"
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => {
    return user.id === id;
  });
};

const getUsersInRoom = room => {
  return users.filter(user => {
    return user.room === room;
  });
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
