import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Cropper from 'cropperjs';
import { Exercise } from '@app/_models/training-model';
import { HttpService } from '@app/_services/http-service/http-service.service';
import { GeneralService } from '@app/_services/general-service/general-service.service';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent implements OnInit {

  @Input() fileInputOptions: any = {bImgInputDisabled: false, bImgInputDirty: false};
  @Input() maxImageNumber: number = 3;
  @Input() maxImageSize: number = 2;    //MB
  @Input() acceptedFormats: string[] = ["image/png", "image/jpeg"];
  @Input() fileList: File[] = [];
  @Input() imgList: any = [];
  @Input() exercise: Exercise = new Exercise();
  public bInitialized: boolean = false;
  public baseServerUrl = this.httpService.baseServerUrl;

  constructor(private toastr: ToastrService, private httpService: HttpService, private generalService: GeneralService) { 
  }

  ngOnInit(): void {
  }

  uploadFile(event) {
    this.fileInputOptions.bImgInputDirty = true;

    let imgList = this.imgList;

    for (let index = 0; index < event.length; index++) {
      const element = event[index]; 
      if(this.fileList.length >= (this.maxImageNumber)) {
        this.toastr.warning("E' possibile caricare al più " + this.maxImageNumber + " immagini, quelle in eccesso sono state scartate");
        break;
      } else if(!this.acceptedFormats.includes(element.type)) {
        this.toastr.warning("Le immmagini devono avere estensione .jpeg, .jpg o .png");
        break;
      } else if(Number((((element).size/1024)/1024).toFixed(4)) >= this.maxImageSize) {  // MB
        this.toastr.warning("La dimensione massima delle immagini deve essere inferiore a " + this.maxImageSize + "MB");
        break;
      } else {
        let reader = new FileReader();
        this.fileList.push(element);
        
        reader.onload = function(e) {
          // document.getElementById("cropImageModalButton").click();
          imgList.push({src: e.target.result, title: element.name, bNew: true});
        }
        reader.readAsDataURL(element);    // convert to base64 string
  
        console.log("Uploaded file", element);
      }
    }  
  }

  deleteAttachment(index) {
    this.fileInputOptions.bImgInputDirty = true;

    (document.getElementById("uploadImagesForm") as HTMLFormElement).reset();
    this.fileList.splice(index, 1);
    this.imgList.splice(index, 1);
  }

  shiftImg(index, shift) {
    this.fileInputOptions.bImgInputDirty = true;
    
    this.generalService.blinkBtn("imgBtn"+index);
    this.generalService.blinkBtn("imgBtn"+(index+shift));

    if (this.imgList && index < this.imgList.length) {
      if((shift==1 && index==(this.imgList.length-1)) || (shift==-1 && index==0)) {
        console.log('ERROR: shifting img of index ' + index);
        return;
      }

      // swap imgList and fileList array elements according to index and shift
      [this.imgList[index], this.imgList[index+shift]] = [this.imgList[index+shift], this.imgList[index]];
      [this.fileList[index], this.fileList[index+shift]] = [this.fileList[index+shift], this.fileList[index]];
    }
  }
}
