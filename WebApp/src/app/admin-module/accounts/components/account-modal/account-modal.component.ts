import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MustMatch } from '@app/_helpers';
import { Account, Role } from '@app/_models';
import { AccountService } from '@app/_services/account-service/account-service.service';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import * as _ from 'lodash';
import { USER_TYPES } from '@app/_models/training-model';
import { userTypeValidator } from '@app/_helpers/user-type.validator';
import { emailValidator } from '@app/_helpers/email.validator';
import { roleValidator } from '@app/_helpers/role.validator';

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
  ACCOUNT_VALIDATORS = this.accountService.ACCOUNT_VALIDATORS;

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
      name: ['', [Validators.required, Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_NAME_LENGTH)]],
      surname: ['', [Validators.required, Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_SURNAME_LENGTH)]],
      dateOfBirth: [''],
      sex: [''],
      userType: [USER_TYPES.ATHLETE, Validators.required],
      bodyWeight: [''],
      yearsOfExperience: [''],
      userEmail: ['', Validators.email],
      telephone: [''],
      residenceState: [''],
      residenceCity: [''],
      residenceAddress: [''],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_EMAIL_LENGTH)]],
      role: [Role.User, Validators.required],
      password: ['', [Validators.required, Validators.minLength(this.ACCOUNT_VALIDATORS.MIN_PSW_LENGTH), Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_PSW_LENGTH)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(this.ACCOUNT_VALIDATORS.MIN_PSW_LENGTH), Validators.maxLength(this.ACCOUNT_VALIDATORS.MAX_PSW_LENGTH)]]
    }, {
      validator: [MustMatch('password', 'confirmPassword'), userTypeValidator('userType'), emailValidator('email'), roleValidator('role')]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      this.toastr.warning("Salvataggio non riuscito: sono presenti degli errori nella compilazione del form");
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
