import {Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { Router } from '@angular/router';
import { JournalService } from '../journal.service';

@Component({
  selector: 'app-guide-dialog',
  templateUrl: './guide-dialog.component.html',
  styleUrls: ['./guide-dialog.component.css']
})
export class GuideDialogComponent implements OnInit {

  constructor(
  public dialogRef: MatDialogRef<GuideDialogComponent>,
  public router: Router,
  public journalService: JournalService) { }

  closeDialog() {
      this.dialogRef.close();
  }

  ngOnInit() {
  }

}
