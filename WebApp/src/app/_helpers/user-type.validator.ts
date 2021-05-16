import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { USER_TYPES } from '@app/_models/training-model';

// custom validator to check that a date is before today and after 01-01-1900
export function userTypeValidator(controlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];

        if (control.value == USER_TYPES.ATHLETE || control.value == USER_TYPES.COACH || control.value == USER_TYPES.BOTH ) {
            control.setErrors(null);
        } else {
            control.setErrors({ invalidUserType: true });
        }
    }
}