import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, interval } from 'rxjs';
import { Entry } from '../entry';
import { AuthenticateService } from '../authentication/authenticate.service';
import { JournalService } from './journal.service';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { faBook } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css']
})
export class JournalComponent implements OnInit {

  public now: string = new Date().toDateString();
  private entry: Entry;
  private daysEntry: Observable<Entry>;
  private submissionStatus: Observable<boolean>;
  private journaledToday: Observable<string>;
  private faBook = faBook;
  private visible = true;
  private selectable = true;
  private removable = true;
  private addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  private formEvents: string[] = [];
  private formConditions: string[] = [];
  public renderedConditions: string[] = [];
  public renderedEvents: string[] = [];
  private entryOpenState = false;
  private viewOpenState = false;
  private journalData: Observable<any>;
  private entryCount: Observable<number>;
  condCtrl = new FormControl();
  filteredConditions: Observable<string[]>;
  eventCtrl = new FormControl();
  filteredEvents: Observable<string[]>;

  @ViewChild('eventInput', {static: false}) eventInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoEvent', {static: false}) eventAutocomplete: MatAutocomplete;
  @ViewChild('conditionInput', {static: false}) conditionInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoCond', {static: false}) condAutocomplete: MatAutocomplete;

  constructor(private authService: AuthenticateService, private journalService: JournalService) {
    this.journalService.getMyConditions().subscribe(conditions => this.renderedConditions = conditions);
    this.filteredConditions = this.condCtrl.valueChanges
    .pipe(startWith(null),map((condition: string | null) => condition ? this._filterConditions(condition) : this.renderedConditions.slice()));
    this.journalService.getMyEvents().subscribe(events => this.renderedEvents = events);
    this.filteredEvents = this.eventCtrl.valueChanges
    .pipe(startWith(null), map((event: string | null) => event ? this._filterEvents(event) : this.renderedEvents.slice()));
  }

  getDate() {
    const timer = interval(1000);
    return timer.pipe(map(now => console.log(now)));
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
    this.journalService.editDaysEvents(event);
  }

  removeDaysCondition(condition: string) {
    this.journalService.editDaysConditions(condition);
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

  submitJournal() {
    let now = Date.now();
    this.entry = {
      date: now,
      events: this.formEvents,
      conditions: this.formConditions
    };
    this.journalService.submitJournal(this.entry);
    this.submissionStatus = this.journalService.submitStatus;
    this.submissionStatus.subscribe(status => {
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
    this.journaledToday = this.journalService.journaledToday();
    this.journalData = this.journalService.formJournalData();
    this.daysEntry = this.journalService.getDaysEntry();
    this.entryCount = this.journalService.getEntryCount();
  }

  ngOnDestroy() {

  }

}
