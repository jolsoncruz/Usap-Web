var form = document.getElementById("signupform");
var OTP = 0;
var valid = 0;

console.log("MESSAGE SHOULD BE BELOW");
console.log("{{message}}");

function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

function getUserData(){

    var userName = document.getElementById('userName').value
    var userEmail = document.getElementById('userEmail').value
    var userPassword = document.getElementById('userPassword').value
    
    var exist = 0;
    
    // userModel.findOne({userEmail: userEmail}, function(err1, userQuery){
    //     if(err1){
    //         console.log(err1.errors);
    //     }
    //     if(userQuery){
    //         console.log("User already Exists!")
    //         exist = 1;
    //     } else {
    //         console.log("Valid user!")
            
    //         function sendOTP(){
    //             // NODEMAILER CONFIG
    //             var smtpTransport = nodemailer.createTransport({
    //                 host: 'smtp.gmail.com',
    //                 port: 465,
    //                 secure: true,
    //                 auth: {
    //                     user: "dlsu.otp@gmail.com",
    //                     pass: "4ry4nJ0150n"
    //                 }
    //             });
        
    //             var mailOptions = {
    //                 from: "dlsu.otp@gmail.com",
    //                 to: newUser.userEmail,
    //                 subject: "De La Salle Usap Verification",
    //                 text: "Verify your account within 5 minutes! Your OTP is : " + OTP
    //             };
        
    //             smtpTransport.sendMail(mailOptions, function(error, response){
    //                 if(error){
    //                     console.log(error);
    //                 }else{
    //                     console.log("Message sent: " + response.message);
    //                 }
                
    //                 // if you don't want to use this transport object anymore, uncomment following line
    //                 //smtpTransport.close(); // shut down the connection pool, no more messages
    //             });
    //         }
        
    //         function generateOTP(){
    //             OTP = Math.floor(100000 + Math.random() * 900000);
    //             valid = 1;
    //             sendOTP();
    //             console.log(OTP);
    //             setTimeout(function() {
    //                 valid = 0;
    //             }, 5 * 60 * 1000);
    //         }
        
    //         generateOTP();
    //         var signupform = document.getElementById("signupform");
    //         var otpform = document.getElementById("otpform");
    //         signupform.classList.toggle("hide");
    //         otpform.classList.toggle("hide");


    //     }
    // })

    
}

function checkOTP(){
    var userOTP = document.getElementById('userOTP').value
    if (valid == 1){
        if (userOTP == OTP){
            newUser.save(function (err, results) {
                console.log(results);
              });
        }
    }
}

    