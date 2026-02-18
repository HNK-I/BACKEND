import dotenv from "dotenv";

dotenv.config({
    path:'./.env'
});

const startserver = async ()=>{
    try{
          // connects database for which whole app waits!!
         await connectDB();
         
         // if any kind of errors occurs when app is starting then throws error on terminal else type of error!!
         app.on("error", (error) => {
            console.log("ERROR",error);
            throw error;
            
        })

        // app to listen requests through port!!
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Server is listening at port:
                ${process.env.PORT}`)
        });

    }catch(error){
        console.log("MongoDB connection failed!!", error);
    }
}

startServer();