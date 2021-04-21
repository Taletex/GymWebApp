import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Cropper from 'cropperjs';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent implements OnInit {

  @Input() fileInputOptions: any = {bImgInputDisabled: false, bImgInputDirty: false};
  @Input() maxImageNumber: number = 3;
  @Input() fileList: File[] = [];
  @Input() imgList: any = [];

  constructor(private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  uploadFile(event) {
    this.fileInputOptions.bImgInputDirty = true;

    let imgList = this.imgList;

    for (let index = 0; index < event.length; index++) {
      if(this.fileList.length >= (this.maxImageNumber)) {
        this.toastr.error("E' possibile caricare al più " + this.maxImageNumber + " immagini, quelle in eccesso sono state scartate");
        break;
      } else {
        const element = event[index];
        let reader = new FileReader();
        this.fileList.push(element);
        
        reader.onload = function(e) {
          // document.getElementById("cropImageModalButton").click();
          imgList.push({src: e.target.result, title: element.name});
        }
        reader.readAsDataURL(element);    // convert to base64 string
  
        console.log("Uploaded file", element);
      }
    }  
  }

  deleteAttachment(index) {
    this.fileList.splice(index, 1);
    this.imgList.splice(index, 1);
  }

}
