import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs'
import { Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

declare const navigator: any;

@Component({
  selector: 'app-midi',
  templateUrl: './midi.component.html',
  styleUrls: ['./midi.component.scss']
})

export class MidiComponent implements OnInit {
  devices: any[] = null;

  constructor() {}

  ngOnInit() {
    this.fetchDevices();
    console.log("death")
  }

  private fetchDevices() {
    var observableFromPromise =  from(navigator.requestMIDIAccess())
    .map((midi: any) => Array.from(midi.inputs)) // convert from iterable
    .map((devices: any) => devices.map(device => device[1])) // grab just the MIDIInput
    .subscribe((devices: any) => this.devices = devices);
   /* Observable
      .fromPromise(navigator.requestMIDIAccess())
      .map((midi: any) => Array.from(midi.inputs)) // convert from iterable
      .map((devices: any) => devices.map(device => device[1])) // grab just the MIDIInput
      .subscribe((devices: any) => this.devices = devices)
    ;*/
  }
}
