import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare const navigator: any;

const noteTransforms = {
  11: 'A0', 12: 'A#0', 13: 'B0',
  14: 'C1', 21: 'C#1', 22: 'D1', 23: 'D#1', 24: 'E1', 31: 'F1', 32: 'F#1', 33: 'G1', 34: 'G#1', 41: 'A1', 42: 'A#1', 43: 'B1',
  44: 'C2', 51: 'C#2', 52: 'D2', 53: 'D#2', 54: 'E2', 61: 'F2', 62: 'F#2', 63: 'G2', 64: 'G#2', 71: 'A2', 72: 'A#2', 73: 'B2',
  74: 'C3', 81: 'C#3', 82: 'D3', 83: 'D#3', 84: 'E3', 15: 'F3', 16: 'F#3', 17: 'G3', 18: 'G#3', 25: 'A3', 26: 'A#3', 27: 'B3',
  28: 'C4', 35: 'C#4', 36: 'D4', 37: 'D#4', 38: 'E4', 45: 'F4', 46: 'F#4', 47: 'G4', 48: 'G#4', 55: 'A4', 56: 'A#4', 57: 'B4',
  58: 'C5', 65: 'C#5', 66: 'D5', 67: 'D#5', 68: 'E5', 75: 'F5', 76: 'F#5', 77: 'G5', 78: 'G#5', 85: 'A5', 86: 'A#5', 87: 'B5',
  88: 'C6', 19: 'SB0', 29: 'SB1', 39: 'SB2', 49: 'SB3', 59: 'SB4', 69: 'SB5', 79: 'SB6', 89: 'SB7', 104: 'ST0', 105: 'ST1', 106: 'ST2',
  107: 'ST3', 108: 'ST4', 109: 'ST5', 110: 'ST6', 111: 'ST7'
};

@Component({
  selector: 'app-msg-note',
  templateUrl: './msg-note.component.html',
  styleUrls: ['./msg-note.component.scss']
})
export class MsgNoteComponent implements OnInit {
  currentNote: any = {
    name: 'N/A',
    status: 'N/A',
    pressure: 0
  };
  noteTransforms = Object.keys(noteTransforms).map((key) => {
    return {frequency: key, note: noteTransforms[key]};
  });

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initMidiStream();
  }

  private initMidiStream() {
    const midiAccess$ = Observable.fromPromise(navigator.requestMIDIAccess());
    const stateStream$ = midiAccess$.flatMap(access => this.stateChangeAsObservable(access));
    const inputStream$ = midiAccess$.map((midi: any) => midi.inputs.values().next().value);

    const messages$ = inputStream$
      .filter(input => input !== undefined)
      .flatMap(input => this.midiMessageAsObservable(input))
      .map((message: any) => {
        const status = message.data[0] & 0xf0;
        return {
          status: status === 144 ? 'PRESSED' : 'RELEASED', // Good until its not ¯\_(ツ)_/¯
          name: noteTransforms[message.data[1]],
          pressure: message.data[2]
        }})
    ;

    stateStream$.subscribe(state => console.log('STATE CHANGE EVENT', state));

    messages$.subscribe(note => {
      this.currentNote = note;
      this.processNoteTransforms(note);
      this.cd.detectChanges();
    });
  }

  private processNoteTransforms(note) {
    this.noteTransforms
      .forEach(n => {
        if (n.note === note.name) {
          n['active'] = note.pressure > 0;
          n['pressure'] = note.pressure;
        }
      });
  }

  private stateChangeAsObservable(midi) {
    const source = new Subject();
    midi.onstatechange = event => source.next(event);
    return source.asObservable();
  }

  private midiMessageAsObservable(input) {
    const source = new Subject();
    input.onmidimessage = note => source.next(note);
    return source.asObservable();
  }

  getAdjustedNoteHeight(note) {
    return `${50 + note.pressure / 2.5}%`;
  }
}
