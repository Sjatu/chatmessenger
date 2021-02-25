const users = []

const addUser = ({ id , username , room }) => {
    //clean the data
    username = username[0].toUpperCase()+username.slice(1).toLowerCase().trim()
    room = room[0].toUpperCase()+room.slice(1).toLowerCase().trim()

    //validate data
    if(!username || !room) {
        return {
            error: 'Username and room required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.username === username
        // return user.room === room && user.username === username
    })

    //validate username
    if(existingUser) {
        return {
            error: 'That Username is already taked, try again!'
        }
    }

    //store user
    const user =  { id , username , room }
    users.push(user)
    return {user}
}

const removeUser = ( id ) => {
    const index = users.findIndex((user) => user.id === id )

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = ( id ) => {
    return users.find((user) => user.id === id
    )
}

const getUserByName = ( name ) => {
    return users.find((user) => user.username === name
    )
}


const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room )
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getUserByName
}