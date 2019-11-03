import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthdialogComponent } from './authdialog.component';

describe('AuthdialogComponent', () => {
  let component: AuthdialogComponent;
  let fixture: ComponentFixture<AuthdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthdialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
