import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintingFrameComponent } from './painting-frame.component';

describe('PaintingFrameComponent', () => {
  let component: PaintingFrameComponent;
  let fixture: ComponentFixture<PaintingFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaintingFrameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaintingFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
