import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsgNoteComponent } from './msg-note.component';

describe('MsgNoteComponent', () => {
  let component: MsgNoteComponent;
  let fixture: ComponentFixture<MsgNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsgNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsgNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
