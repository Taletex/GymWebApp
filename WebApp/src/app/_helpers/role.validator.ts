import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { Role } from '@app/_models/role';

// custom validator to check that a date is before today and after 01-01-1900
export function roleValidator(controlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];

        if (control.value == Role.Admin || control.value == Role.User) {
            control.setErrors(null);
        } else {
            control.setErrors({ invalidRole: true });
        }
    }
}