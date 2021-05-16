import { FormGroup } from '@angular/forms';
import * as moment from 'moment';

// custom validator to check that a date is before today and after 01-01-1900
export function dateValidator(controlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];

        if (moment(control.value).isBefore(moment('1900-01-01T00:00')) || moment(control.value).isAfter(moment())) {
            control.setErrors({ invalidDate: true });
        } else {
            control.setErrors(null);
        }
    }
}