import { io } from "socket.io-client";

// Apne Azure Backend ka URL yahan daal
const SOCKET_URL = "https://nyayconnect-api-frg8c7cggxhvdgg6.koreacentral-01.azurewebsites.net";

export const socket = io(SOCKET_URL, {
    autoConnect: false, // Hum ise login ke baad manually connect karenge
    transports: ["websocket"] // Azure pe websocket transport fast chalta hai
});