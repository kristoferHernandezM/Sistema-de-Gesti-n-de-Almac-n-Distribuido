rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "192.168.4.104:27017", priority: 2 },
    { _id: 1, host: "192.168.4.105:27017", priority: 1 }
  ]
})