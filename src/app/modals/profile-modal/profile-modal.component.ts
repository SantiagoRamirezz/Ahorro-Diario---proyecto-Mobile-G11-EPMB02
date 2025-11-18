import { Component, OnInit, inject } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { ToastController } from '@ionic/angular/standalone';

@Component({
    standalone: true,
    selector: 'app-profile-modal',
    templateUrl: './profile-modal.component.html',
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonContent,
        IonInput,
        ReactiveFormsModule,
    ],
    providers: [ModalController, ToastController]
})
export class ProfileModalComponent implements OnInit {

    form!: FormGroup;

    private fb = inject(FormBuilder)
    private modalCtrl = inject(ModalController)
    private profileService = inject(ProfileService)
    private toastCtrl = inject(ToastController)

    async ngOnInit() {
        this.form = this.fb.group({
            name: ['', Validators.required]
        });

        const savedName = await this.profileService.getUserName();
        if (savedName) {
            this.form.get('name')?.setValue(savedName);
        }
    }

    async save() {
        const name = this.form.get('name')?.value;
        if (name) {
            await this.profileService.setUserName(name);
            this.modalCtrl.dismiss(name);

            // Mostrar alerta tipo toast
            const toast = await this.toastCtrl.create({
                message: 'Nombre guardado correctamente',
                duration: 2000,
                color: 'success',
                position: 'bottom'
            });
            await toast.present();
        }
    }

    close() {
        this.modalCtrl.dismiss(false);
    }
}
