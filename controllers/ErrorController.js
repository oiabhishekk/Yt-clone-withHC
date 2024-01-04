export const globalErrorHandler=(error,req,res,next)=>{
   error.statusCode=error.statusCode||500;
  res.status(error.statusCode).json({
    status:error.statusCode,
    message:error.message 
  })
}