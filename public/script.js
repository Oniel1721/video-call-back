
// const socket = new WebSocket('ws://127.0.0.1:3000/')
// socket.addEventListener('open', (s)=>{
//     console.log(socket)
// })


// setTimeout(()=>{
//     console.log(socket)
// }, 1000)

const a = async ()=>{
    const res = await fetch('http://127.0.0.1:3000/')
    console.log(res)
}


a()