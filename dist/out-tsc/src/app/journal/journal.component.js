import { __decorate } from "tslib";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { faBook } from '@fortawesome/free-solid-svg-icons';
let JournalComponent = class JournalComponent {
    constructor(authService, journalService) {
        this.authService = authService;
        this.journalService = journalService;
        this.now = new Date().toDateString();
        this.faBook = faBook;
        this.visible = true;
        this.selectable = true;
        this.removable = true;
        this.addOnBlur = true;
        this.separatorKeysCodes = [ENTER, COMMA];
        this.formEvents = [];
        this.formConditions = [];
        this.renderedConditions = [];
        this.renderedEvents = [];
        this.entryOpenState = false;
        this.viewOpenState = false;
        this.conditionData = new Subject();
        this.condCtrl = new FormControl();
        this.eventCtrl = new FormControl();
        this.journalService.getMyConditions().subscribe(conditions => this.renderedConditions = conditions);
        this.filteredConditions = this.condCtrl.valueChanges.pipe(startWith(null), map((condition) => condition ? this._filterConditions(condition) : this.renderedConditions.slice()));
        this.journalService.getMyEvents().subscribe(events => this.renderedEvents = events);
        this.filteredEvents = this.eventCtrl.valueChanges.pipe(startWith(null), map((event) => event ? this._filterEvents(event) : this.renderedEvents.slice()));
    }
    getDate() {
        let now = Date.now();
        const timer = interval(1000);
        return timer.pipe(map(now => console.log(now)));
    }
    addEventChip(event) {
        if (!this.eventAutocomplete.isOpen) {
            const input = event.input;
            const value = event.value;
            if ((value || '').trim()) {
                this.formEvents.push(value.trim());
            }
            if (input) {
                input.value = '';
            }
            this.eventCtrl.setValue(null);
        }
    }
    addConditionChip(event) {
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
    removeEventChip(event) {
        const index = this.formEvents.indexOf(event);
        if (index >= 0) {
            this.formEvents.splice(index, 1);
        }
    }
    removeConditionChip(event) {
        const index = this.formConditions.indexOf(event);
        if (index >= 0) {
            this.formConditions.splice(index, 1);
        }
    }
    removeDaysEvent(event) {
        this.journalService.editDaysEvents(event);
    }
    removeDaysCondition(condition) {
        this.journalService.editDaysConditions(condition);
    }
    selectedEvent(event) {
        this.formEvents.push(event.option.viewValue);
        this.eventInput.nativeElement.value = '';
        this.eventCtrl.setValue(null);
    }
    selectedCond(event) {
        this.formConditions.push(event.option.viewValue);
        this.conditionInput.nativeElement.value = '';
        this.condCtrl.setValue(null);
    }
    _filterEvents(value) {
        const filterValue = value.toLowerCase();
        return this.renderedEvents.filter(event => event.toLowerCase().indexOf(filterValue) === 0);
    }
    _filterConditions(value) {
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
        });
    }
    getConditionData(condition) {
        this.journalService.getConditionData(condition)
            .subscribe(data => {
            this.conditionData.next(data);
        });
    }
    signOut() {
        this.authService.signOut();
    }
    ngOnInit() {
        this.journaledToday = this.journalService.journaledToday();
        this.myConditions = this.journalService.getMyConditions();
        this.myEvents = this.journalService.getMyEvents();
        this.journalData = this.journalService.formJournalData();
        this.daysEvents = this.journalService.getDaysEvents();
        this.daysConditions = this.journalService.getDaysConditions();
        this.journalService.setEntryCount();
        this.entryCount = this.journalService.entryCount;
    }
    ngOnDestroy() {
    }
};
__decorate([
    ViewChild('eventInput', { static: false })
], JournalComponent.prototype, "eventInput", void 0);
__decorate([
    ViewChild('autoEvent', { static: false })
], JournalComponent.prototype, "eventAutocomplete", void 0);
__decorate([
    ViewChild('conditionInput', { static: false })
], JournalComponent.prototype, "conditionInput", void 0);
__decorate([
    ViewChild('autoCond', { static: false })
], JournalComponent.prototype, "condAutocomplete", void 0);
JournalComponent = __decorate([
    Component({
        selector: 'app-journal',
        templateUrl: './journal.component.html',
        styleUrls: ['./journal.component.css']
    })
], JournalComponent);
export { JournalComponent };
//# sourceMappingURL=journal.component.js.map