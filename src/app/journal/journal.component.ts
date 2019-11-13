import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, interval, Subject, of, from } from 'rxjs';
import { Entry } from '../entry';
import { AuthenticateService } from '../authentication/authenticate.service';
import { JournalService } from './journal.service';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { faBook, faQuestion, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { GuideDialogComponent } from './guide-dialog/guide-dialog.component';
import { MatDialog, MatDialogConfig } from "@angular/material";

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css']
})
export class JournalComponent implements OnInit {

  public now: string = new Date().toDateString();
  public entry: Entry;
  public daysEntry$: Observable<Entry>;
  public daysEvents$: Observable<string[]>;
  public daysConditions$: Observable<string[]>;
  private expiredEvent: boolean = false;
  private daysEntryDate: number;
  public submissionStatus$: Observable<boolean>;
  public journaledToday$: Observable<string>;
  public faBook = faBook;
  public faQuestion = faQuestionCircle;
  public visible = true;
  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public formEvents: string[] = [];
  public formConditions: string[] = [];
  public renderedConditions: string[] = [];
  public renderedEvents: string[] = [];
  public entryOpenState = true;
  public viewOpenState = false;
  public journalData$: Observable<any>;
  public entryCount$: Observable<number>;
  condCtrl = new FormControl();
  filteredConditions$: Observable<string[]>;
  eventCtrl = new FormControl();
  filteredEvents$: Observable<string[]>;

  @ViewChild('eventInput', {static: false}) eventInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoEvent', {static: false}) eventAutocomplete: MatAutocomplete;
  @ViewChild('conditionInput', {static: false}) conditionInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoCond', {static: false}) condAutocomplete: MatAutocomplete;

  constructor(
    private authService: AuthenticateService,
    private journalService: JournalService,
		private dialog: MatDialog) {
    this.journalService.getMyConditions().subscribe(conditions => this.renderedConditions = conditions);
    this.filteredConditions$ = this.condCtrl.valueChanges
    .pipe(startWith(null),map((condition: string | null) => condition ? this._filterConditions(condition) : this.renderedConditions.slice()));
    this.journalService.getMyEvents().subscribe(events => this.renderedEvents = events);
    this.filteredEvents$ = this.eventCtrl.valueChanges
    .pipe(startWith(null), map((event: string | null) => event ? this._filterEvents(event) : this.renderedEvents.slice()));
  }

  getDate() {
    const timer = interval(1000);
    return timer.pipe(map(now => console.log(now)));
  }

  isToday(td) {
    const today = new Date();
    const date = new Date(td);
    return today.toDateString() == date.toDateString();
  }

  guideDialog() {
		const dialogConfig = new MatDialogConfig();
    this.dialog.open(GuideDialogComponent, dialogConfig);
	}

  addEventChip(event: MatChipInputEvent): void {
    if (!this.eventAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      if ((value || '').trim()) {
        this.formEvents.push(value.trim());
      }
      if (input) {
        input.value = '';
      } this.eventCtrl.setValue(null);
    }
  }

  addConditionChip(event: MatChipInputEvent): void {
    if (!this.condAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      if ((value || '').trim()) {
        this.formConditions.push(value.trim());
      }
      if (input) {
        input.value = '';
      }
      this.condCtrl.setValue(null);
    }
  }

  removeEventChip(event: string): void {
    const index = this.formEvents.indexOf(event);
    if (index >= 0) {
      this.formEvents.splice(index, 1);
    }
  }

  removeConditionChip(event: string): void {
    const index = this.formConditions.indexOf(event);
    if (index >= 0) {
      this.formConditions.splice(index, 1);
    }
  }

  removeDaysEvent(event: string) {
    if (this.isToday(this.daysEntryDate)) {
      this.journalService.editDaysEvents(event);
    } else {
      this.signOut();
      console.log('modal warning that the day is over.');
    }
  }

  removeDaysCondition(condition: string) {
    if (this.isToday(this.daysEntryDate)) {
      this.journalService.editDaysConditions(condition);
    } else {
      this.signOut();
      console.log('modal warning that the day is over.');
    }
  }

  selectedEvent(event: MatAutocompleteSelectedEvent): void {
    this.formEvents.push(event.option.viewValue);
    this.eventInput.nativeElement.value = '';
    this.eventCtrl.setValue(null);
  }

  selectedCond(event: MatAutocompleteSelectedEvent): void {
    this.formConditions.push(event.option.viewValue);
    this.conditionInput.nativeElement.value = '';
    this.condCtrl.setValue(null);
  }

  private _filterEvents(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.renderedEvents.filter(event => event.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterConditions(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.renderedConditions.filter(condition => condition.toLowerCase().indexOf(filterValue) === 0);
  }

  submitEntry() {
    let now = Date.now();
    this.entry = {
      date: now,
      events: this.formEvents,
      conditions: this.formConditions
    };
    this.journalService.submitEntry(this.entry);
    this.submissionStatus$ = this.journalService.submitStatus;
    this.submissionStatus$.subscribe(status => {
      if (status === true) {
        this.formEvents = [];
        this.formConditions = [];
      }
    })
  }


  signOut() {
    this.authService.signOut();
  }

  ngOnInit() {
    this.journaledToday$ = this.journalService.journaledToday().pipe(map(data => data ? data : 'false'));
    this.journalData$ = this.journalService.formJournalData();
    this.daysEntry$ = this.journalService.getDaysEntry();
    this.daysEntry$.subscribe(entry => {
      if (entry[0]) {
        this.daysEntryDate = entry[0].date;
      }
    });
    this.daysEvents$ = this.daysEntry$.pipe(map(entry => entry[0] ? entry[0].events : []));
    this.daysConditions$ = this.daysEntry$.pipe(map(entry => entry[0] ? entry[0].conditions : []));
    this.entryCount$ = this.journalService.getEntryCount();
  }

  ngOnDestroy() {

  }

}
