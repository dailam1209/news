const nodeMailer = require("nodemailer");

const sendEmail =  async (options) => {
    const transporter = nodeMailer.createTransport({
        secure: true,
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
        tls: {
            rejectUnauthorized: false,

        }
    });

    const optionMail =  {
        form: process.env.EMAIL,
        to: options.email,
        subject: "Well come to VietNam News Online",
        context: {
            name: "VieNam News",
            company: "YOU"
        },
        html: '<p>Hi '+options.email+' Code NewPassword is: '+options.code+' </p>'
    }
    transporter.sendMail(optionMail, function( err, infor) {
        if(err) throw Error(err);
    })
};

module.exports = sendEmail;
