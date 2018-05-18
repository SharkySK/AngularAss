import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { D3 } from 'd3-ng2-service';
import Tone from 'tone';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
import { MatSliderModule } from '@angular/material';

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

declare const navigator: any;
/*const Tone = window['Tone'];
const Recorder = window['Recorder'];*/

@Component({
  selector: 'app-sound',
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.scss']
})
export class SoundComponent implements OnInit {
  value = 0;
  //@ViewChild('fftElement') fftElement;
  //@ViewChild('waveformElement') waveformElement;

  notes: Array<any> = [];
  noteTransforms = Object.keys(noteTransforms).map((key) => {
    return {frequency: key, note: noteTransforms[key]};
  });

  synth = null;
  fft = null;
  waveform = null;

  constructor(private cd: ChangeDetectorRef) {
    this.synth = this.initSynth();
  }

  ngOnInit() {
    this.initMidiInput();
    /*this.initAnalyzer();*/
  }

  // -------------------------------------------------------------------
  // RxJS MIDI with TONEJS
  // -------------------------------------------------------------------
  noteOn(note, velocity) {
    this.synth.triggerAttack(note, null, velocity);
  }

  noteOff(note) {
    this.synth.triggerRelease(note);
  }

  private initMidiInput() {
    const midiAccess$ = Observable.fromPromise(navigator.requestMIDIAccess());
    const stateStream$ = midiAccess$.flatMap(access => this.stateChangeAsObservable(access));
    const inputStream$ = midiAccess$.map((midi: any) => midi.inputs.values().next().value);

    const messages$ = inputStream$
      .filter(input => input !== undefined)
      .flatMap(input => this.midiMessageAsObservable(input))
      .map((message: any) => ({
        // Collect relevant data from the message
        // See for example http://www.midi.org/techspecs/midimessages.php
        status: message.data[0] & 0xf0,
        data: [
          message.data[1],
          message.data[2],
        ],
      }))
    ;

    stateStream$.subscribe(state => console.log('STATE CHANGE EVENT', state));

    messages$.subscribe(note => {
      this.midiMessageReceived(note);
      this.cd.detectChanges();
    });
  }

  private midiMessageReceived(message: any) {
    let cmd = message.status >> 4;
    let channel = message.status & 0xf;
    let noteNumber = noteTransforms[message.data[0]];
    let velocity = 0;
    if (message.data.length > 1) {
      velocity = message.data[1] / 120; // needs to be between 0 and 1 and sometimes it is over 100 ¯\_(ツ)_/¯
    }

    // MIDI noteon with velocity=0 is the same as noteoff
    if (cmd === 8 || ((cmd === 9) && (velocity === 0))) { // noteoff
      this.noteOff(noteNumber);
    } else if (cmd === 9) { // note on
      this.noteOn(noteNumber, velocity);
    } else if (cmd === 11) { // controller message
      // do something eventually!
    } else {
      // probably sysex!
    }
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

  private initSynth() {
    this.fft = new Tone.Analyser('fft', 32);
    this.waveform = new Tone.Analyser('waveform', 1024);

    var tremolo = new Tone.Tremolo(9, 2).start();
    var distortion = new Tone.Distortion(2);
    var pingPong = new Tone.PingPongDelay(0.1, 0.6);
    var chorus = new Tone.Chorus(4, 2.5, 0.5);
    var reverb = new Tone.Reverb();

    var polySynth = new Tone.PolySynth(6, Tone.Synth, {
        'oscillator': {
          'type': 'square4',
          'count': 8,
          'spread': 10
        },
        'envelope': {
          'attack': 0.01,
          'decay': 0.1,
          'sustain': 0.4,
          'release': 0.5,
          'attackCurve': 'exponential'
        },
      }).chain(distortion, chorus, Tone.Master);//.connect(pingPong);
      /*.fan(this.fft, this.waveform)*/
      //.toMaster();

    //polySynth.connect(distortion);

    return polySynth;

  }
/*
  private initAnalyzer() {
    // this.initFFTAnalyzer();
    this.initWaveAnalyzer();
  }
*/
  // TODO Break into components
  private initFFTAnalyzer() {
    let fft = this.fft;
    let element: any = document.getElementById('fftElement'); // change
    let fftContext = element.getContext('2d');
    let canvasWidth, canvasHeight;

    function drawFFT(values){
      fftContext.clearRect(0, 0, canvasWidth, canvasHeight);
      let barWidth = canvasWidth / fft.size;
      for (let i = 0, len = values.length; i < len; i++){
        let val = values[i] / 255;
        let x = canvasWidth * (i / len);
        let y = val * canvasHeight;
        fftContext.fillStyle = 'rgba(70, 168, 215, ' + val + ')';
        fftContext.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
      }
    }

    function resize() {
      canvasWidth = element.width;
      canvasHeight = element.height;
    }

    function loop(){
      requestAnimationFrame(loop);
      // get the fft data and draw it
      let fftValues = fft.analyse();
      drawFFT(fftValues);
    }

    window.addEventListener('resize', resize);

    resize();

    loop();
  }
/*
  initWaveAnalyzer() {
    let waveform = this.waveform;
    let element: any = this.waveformElement.nativeElement;
    let waveContext = element.getContext('2d');
    let canvasWidth, canvasHeight, waveformGradient;

    function drawWaveform(values) {
      // draw the waveform
      waveContext.clearRect(0, 0, canvasWidth, canvasHeight);
      waveContext.beginPath();
      waveContext.lineJoin = 'miter';
      waveContext.lineWidth = 2;
      waveContext.strokeStyle = waveformGradient;
      waveContext.moveTo(0, (values[0] / 255) * canvasHeight);

      for (let i = 1, len = values.length; i < len; i++){
        let val = values[i] / 255;
        let x = canvasWidth * (i / len);
        let y = val * canvasHeight;
        waveContext.lineTo(x, y);
      }
      waveContext.stroke();
    }

    function resize() {
      canvasWidth = element.width;
      canvasHeight = element.height;

      waveformGradient = waveContext.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      waveformGradient.addColorStop(0, '#814f98');
      waveformGradient.addColorStop(1, '#46a8d7');
    }

    function loop(){
      requestAnimationFrame(loop);
      // get the waveform valeus and draw it
      let waveformValues = waveform.analyse();
      drawWaveform(waveformValues);
    }

    window.addEventListener('resize', resize);

    resize();

    loop();*/
}

