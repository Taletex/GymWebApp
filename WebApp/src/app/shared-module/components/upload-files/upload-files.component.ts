import { Component, Input, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent implements OnInit {

  @Input() imgInputDisabled: boolean = false;
  @Input() maxImageNumber: number = 3;
  files: any = [];
  imgList: any = [];

  constructor(private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  uploadFile(event) {
    let imgList = this.imgList;

    for (let index = 0; index < event.length; index++) {
      if(this.files.length >= (this.maxImageNumber)) {
        this.toastr.error("E' possibile caricare al più " + this.maxImageNumber + " immagini, quelle in eccesso sono state scartate");
        break;
      } else {
        const element = event[index];
        let reader = new FileReader();
        this.files.push(element.name);
        
        reader.onload = function(e) {
          imgList.push({src: e.target.result, title: element.name});
        }
        reader.readAsDataURL(element);    // convert to base64 string
  
        console.log("Uploaded file", element);
      }
    }  
  }

  deleteAttachment(index) {
    this.files.splice(index, 1);
    this.imgList.splice(index, 1);
  }

}
