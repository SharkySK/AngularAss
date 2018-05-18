import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material';
import { MatSliderModule } from '@angular/material';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MidiComponent } from './midi/midi.component';
import { MessagesComponent } from './message/message.component';
import { MsgNoteComponent } from './msg-note/msg-note.component';
import { SoundComponent } from './sound/sound.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'ng2-knob';



@NgModule({
  declarations: [
    AppComponent,
    MidiComponent,
    MessagesComponent,
    MsgNoteComponent,
    SoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatSliderModule,
    BrowserAnimationsModule,
    FormsModule,
    KnobModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
