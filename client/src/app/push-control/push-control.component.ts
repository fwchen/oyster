import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { WebPushService } from '../web-push.service';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-push-control',
  templateUrl: './push-control.component.html',
  styleUrls: ['./push-control.component.css']
})
export class PushControlComponent implements OnInit {
  private swScope = './web-push-service-worker.js';

  constructor(
    private configService: ConfigService,
    private webPushService: WebPushService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  public async subscribeToPush(): Promise<void> {
    try {
      const publicKey: string = this.configService.getConfig('vapidPublicKey');
      const convertedVapidKey = this.webPushService.urlBase64ToUint8Array(publicKey);

      const registration = await navigator.serviceWorker.getRegistration(this.swScope);

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        this.snackBar.open('You already subscribed.', null, {
          duration: 2000
        });
      } else {
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });

        this.webPushService.addSubscriber(pushSubscription).subscribe(
          res => {
            console.log('[App] Add subscriber request answer', res);
            this.snackBar.open('Now you are subscribed', null, {
              duration: 2000
            });
          },
          err => {
            console.error('[App] Add subscriber request failed', err);
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
}