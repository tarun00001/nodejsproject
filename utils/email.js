const nodemailer = require("nodemailer");

async function sendMail({ from , to, subject, text, html }) {
  try {
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'patrick.mohr18@ethereal.email',
            pass: 'ZmynBhVsHrk6R2NSwY'
        }
      }); 

    //   console.log(from, to, subject, text, html)
      const mailOptions = {
        from,
        to,
        subject,
        text,
        html
    }
    // console.log(mailOptions)
      let info = await transporter.sendMail(mailOptions);

      console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
     
  } catch (error) {
      console.log(error)
  }
}

module.exports = sendMail;