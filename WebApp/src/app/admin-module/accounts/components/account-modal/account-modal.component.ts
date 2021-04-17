import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MustMatch } from '@app/_helpers';
import { Account } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-account-modal',
  templateUrl: './account-modal.component.html',
  styleUrls: ['./account-modal.component.scss']
})
export class AccountModalComponent implements OnInit {

  @Input() createModalResult: any;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onAbort: EventEmitter<any> = new EventEmitter();
  modal: any;
  form: FormGroup;
  id: string;
  userId: string;
  bLoading = false;
  submitted = false;
  closeResult: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private toastr: ToastrService,
    private httpService: HttpService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      dateOfBirth: [''],
      sex: [''],
      userType: ['', Validators.required],
      bodyWeight: [''],
      yearsOfExperience: [''],
      userEmail: ['', Validators.email],
      telephone: [''],
      residenceState: [''],
      residenceCity: [''],
      residenceAddress: [''],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [Validators.minLength(6), Validators.required]],
      confirmPassword: ['']
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.createModalResult.data = this.form.value;
    this.modal.close(this.createModalResult);
  }

  public openAccountModal(content) {
    this.modal = this.modalService.open(content, { size: "lg", centered: true, scrollable: true, backdrop: "static" });
    this.modal.result.then((result) => {
      this.onClose.emit(null);
    }, (reason) => {
      this.onAbort.emit(null);
    });
  }

}
