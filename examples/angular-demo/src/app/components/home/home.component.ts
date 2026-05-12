import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight, Box, CreditCard, QrCode, Scan, Settings } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  readonly ArrowRightIcon = ArrowRight;
  readonly BoxIcon = Box;
  readonly CreditCardIcon = CreditCard;
  readonly QrCodeIcon = QrCode;
  readonly ScanIcon = Scan;
  readonly SettingsIcon = Settings;
}
