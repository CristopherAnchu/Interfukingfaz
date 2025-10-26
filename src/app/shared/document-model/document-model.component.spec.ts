import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentModelComponent } from './document-model.component';

describe('DocumentModelComponent', () => {
  let component: DocumentModelComponent;
  let fixture: ComponentFixture<DocumentModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
