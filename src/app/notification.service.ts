import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
    private audio = new Audio('assets/Sounds/notification-2-269292.mp3'); // Adjusted path

    constructor() {
      this.audio.load(); // Preload the audio
    }
  
    playNotificationSound() {
      console.log("playNotificationSound");
  
      // Ensure the browser allows audio playback
      this.audio.play().catch(error => {
        console.error('Audio play error:', error);
        
        // Try resuming the AudioContext
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            this.audio.play();
          });
        }
      });
    }
}