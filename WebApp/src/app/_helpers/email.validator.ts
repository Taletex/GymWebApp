import { FormGroup } from '@angular/forms';
import * as moment from 'moment';

// custom validator to check that a date is before today and after 01-01-1900
export function emailValidator(controlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];

        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(re.test(String(control.value).toLowerCase()))
            control.setErrors(null);
        else
            control.setErrors({ invalidEmail: true });
    }
}

