import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  constructor(private config: ConfigService) {}
  #myMailSrv = this.config.get('EMAIL_SERVICE');
  #myMail: string = this.config.get('EMAIL_USER');
  #myPass: string = this.config.get('EMAIL_PASSWORD');
  #baseUrl: string = this.config.get('BASE_URL');
  #mutationName = 'verify';

  #getCompleteEmailBody(param1: string) {
    //TODO: send userId in params???
    const url = `${this.#baseUrl}?query=mutation+{${
      this.#mutationName
    }(code:"${param1}")}`;

    const html = `<h3>Account verification</h3>
    <p>Please verify your account by clicking the link below</p>
  <a href=${url}> Click provided link</a>`;

    return html;
  }
  #transporter = nodemailer.createTransport({
    service: this.#myMailSrv,
    port: 465,
    auth: {
      user: this.#myMail,
      pass: this.#myPass,
    },
  });

  async sendEmail(recipient: string, param1: string) {
    try {
      await this.#transporter.sendMail({
        from: this.#myMail,
        to: recipient,
        subject: 'Account verification',
        html: this.#getCompleteEmailBody(param1),
      });

      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);

      throw new HttpException(
        'Error while sending verification code',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }
}
