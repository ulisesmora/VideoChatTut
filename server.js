const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
let rooms = [];
const io = require("socket.io")(server, {
	cors: {
		origin: "https://test-zoom-14ac5.web.app",
		//origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
})


io.on("connection", (socket) => {
	socket.emit("me", socket.id /*socket.id*/)
	console.log("se conecto", socket.id);

	socket.on("disconnect", () => {
		console.log(socket.id,"se desconecto")
		const num = rooms.findIndex(inf => inf.info.userId == socket.id);
		rooms.splice(num,1);
		console.log(rooms,"rr");
		socket.broadcast.emit("callEnded")
		console.log("desconectado");
	})

	socket.on("createRoom",(data) => {
		const found = rooms.find(inf => inf.id == data.id);
		if(!found){
		rooms.push({id:data.id, info: {userId: socket.id}})
		socket.emit('returnDrawer', "owner");
		}else{
			if(data.userId != found.info.userId){
			socket.emit('returnDrawer', found.info.userId);
			}else{
				socket.emit('returnDrawer', "owner");
			}
		}
	})


	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
		console.log("llamando");
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal);
		console.log("llamada aceptada");
	})
})


server.listen(process.env.PORT || 5000, () => console.log("server is running on port 5000"))
//server.listen(5000, () => console.log("server is running on port 5000"))
