import * as SparkPost from "sparkpost";

const client = new SparkPost(process.env.SP_API_KEY);

export const sendEmail = async (recipient: string, url: string) => {
  try {
    const response = await client.transmissions.send({
      options: {
        sandbox: true,
      },
      content: {
        from: "testing@sparkpostbox.com",
        subject: "Hello, world!",
        html: `<html>
            <body>
              <p>Your confirmation url is:</p>
              <a href="${url}">Confirm Email</a>
            </body>
          </html>`,
      },
      recipients: [{ address: recipient }],
    });
    console.log(response);
  } catch (err) {
    console.log(err);
  }
};
