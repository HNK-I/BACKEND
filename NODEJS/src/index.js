import dotenv from "dotenv";
import app from './app.js';
import connectDB from './config/database.js';

dotenv.config({
    path:'./.env'
});

const startServer = async ()=>{
    try{
          // connects database for which whole app waits!!
         await connectDB();
         
         // if any kind of errors occurs when app is starting then throws error on terminal else type of error!!
         app.on("error", (error) => {
            console.log("Server Error:",error);
            if(error.code === 'EADDRINUSE') {
                console.log(`Port ${process.env.PORT} is already in use`);
                process.exit(1);
            }
        })

        // app to listen requests through port!!
        const server = app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Server is listening at port: ${process.env.PORT || 8000}`)
        });

        server.on('error', (error) => {
            if(error.code === 'EADDRINUSE') {
                console.log(`Port ${process.env.PORT} is already in use. Please kill the process or use a different port.`);
                process.exit(1);
            }
        });

    }catch(error){
        console.log("MongoDB connection failed!!", error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    process.exit(1);
});

startServer();