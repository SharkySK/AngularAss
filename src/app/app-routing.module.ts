import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MidiComponent } from './midi/midi.component';
import { MessagesComponent } from './message/message.component';
import { SoundComponent } from './sound/sound.component';

const routes: Routes = [
  {path: 'MIDI', redirectTo: '/MIDI', pathMatch: 'full'},
  {path: 'MIDI', component: MidiComponent},
  {path: 'Sound', redirectTo: '/Sound', pathMatch: 'full'},
  {path: 'Sound', component: SoundComponent},
  {path: 'Messages', redirectTo: '/Messages', pathMatch: 'full'},
  {path: 'Messages', component: MessagesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
