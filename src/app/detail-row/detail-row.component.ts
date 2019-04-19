import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { GridComponent} from '@progress/kendo-angular-grid';

interface Parrent {
  id: number;
  ime: string;
  prezime: string;
  children: Parrent2;
}

interface Parrent2 {
  id: number;
  godinaRodjenja: number;
  ime: string;
  prezime: string;
  mestoRodjenja: string;
  opis: string;
}
interface ParrentId extends Parrent {
  id: number;
}

interface Children {
  id: number;
  godinaRodjenja: number;
  ime: string;
  prezime: string;
  mestoRodjenja: string;
  opis: string;
}

interface ChildrenId extends Children {
  id: number;
}

@Component({
  selector: 'app-detail-row',
  templateUrl: './detail-row.component.html',
  styleUrls: ['./detail-row.component.css']
})

export class DetailRowComponent implements OnInit {

  @ViewChild('tabela') grid: GridComponent;
  @ViewChild('close') closeButton: ElementRef;
  @ViewChild('ime') imeModal: ElementRef;

  constructor(private afs: AngularFirestore, private el: ElementRef) {}

  model: any = {}; // zbog validacije
  parrentsCol: AngularFirestoreCollection<Parrent>;
  parrents: any;
  childrenCol: AngularFirestoreCollection<Children>;
  childrens: any;
  parrentDoc: AngularFirestoreDocument<Parrent>;
  parrent: Observable<Parrent>;
  childrenDoc: AngularFirestoreDocument<Children>;
  children: Observable<Children>;

  formGroup: FormGroup;
  private editedRowIndex: number;
  idDobijen: string;
  izabranoZaUpdateChildren = false;
     roditelji: any[] = [];
     deca: { id: number, ime: string, prezime: string, godinaRodjenja: number, mestoRodjenja: string, opis: string }[] = [];
     idIzBaze: {id: number, ime: string, prezime: string} [] = [];
     idIzBazeChildren: { id: number, ime: string, prezime: string, godinaRodjenja: number, mestoRodjenja: string, opis: string }[] = [];
     keyIzBaze: any [] = [];
     keyIzBazeChildren: any [] = [];
     keyZaUpdateChildren: string;
     idZaUpdateChildren: number;
     d = new Date();
     currentYear = this.d.getUTCFullYear();

    ngOnInit() {
      // za get from firebase parrente
      this.roditelji = [];
      this.deca = [];
      this.parrentsCol = this.afs.collection('parrentDB');
      this.parrents = this.parrentsCol.snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Parrent;
            const id = a.payload.doc.id;
            this.roditelji.push(data);
            this.idIzBaze.push(data);
            this.keyIzBaze.push(id);
            // console.log(this.roditelji);
            return { id, data };
          });
        });

      // za get from firebase childrene
      this.childrenCol = this.afs.collection('childrenDB');
      this.childrens = this.childrenCol.snapshotChanges()
          .map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data() as Children;
              const id = a.payload.doc.id;
              this.deca.push(data);
              // console.log(this.deca);
              this.idIzBazeChildren.push(data);
              this.keyIzBazeChildren.push(id);
              return { id, data };
            });
          });
    }

    public addHandler({sender}) {
        this.closeEditor(sender);

        this.formGroup = new FormGroup({
            id: new FormControl(),
            ime: new FormControl('', Validators.required),
            prezime: new FormControl('', Validators.required),
            children: new FormControl([])
        });
        sender.addRow(this.formGroup);
    }

    public editHandler({sender, rowIndex, dataItem}) {
        this.closeEditor(sender);

        this.formGroup = new FormGroup({
            id: new FormControl(dataItem.id),
            ime: new FormControl(dataItem.ime, Validators.required),
            prezime: new FormControl(dataItem.prezime, Validators.required),
            children: new FormControl(dataItem.children)
        });
        this.editedRowIndex = rowIndex;
        sender.editRow(rowIndex, this.formGroup);
    }

    public cancelHandler({sender, rowIndex}) {
        this.closeEditor(sender, rowIndex);
    }

    public saveHandler({sender, rowIndex, formGroup, isNew}) {
        const item = {...formGroup.value};
        let zadnjiIdIzBaze = 0;
        if (isNew) {
          this.roditelji.unshift(item);
          // prvo mora da nadje zadnji id iz firebase
          // tslint:disable-next-line:prefer-for-of
          for (let index = 0; index < this.idIzBaze.length; index++) {
              if (this.idIzBaze[index].id > zadnjiIdIzBaze) {
                zadnjiIdIzBaze = this.idIzBaze[index].id;
              }
          }

          this.afs.collection('parrentDB').add({id: zadnjiIdIzBaze + 1, ime: item.ime, prezime: item.prezime, children: item.children});
        } else {
          this.roditelji.splice(rowIndex, 1, item);
          // prvo da mu nadjem key iz firebase
          for (let index = 0; index < this.idIzBaze.length; index++) {
          if (this.idIzBaze[index].id === item.id) {
            this.idDobijen = this.keyIzBaze[index];
            break;
          }
        }
          this.afs.collection('parrentDB').doc(this.idDobijen).update({
          id: item.id,
          ime: item.ime,
          prezime: item.prezime,
          children: item.children
        })
        .then(function() {
            console.log('Uspesno updatovano!');
        });
        }
        sender.closeRow(rowIndex);
        this.roditelji = [];
    }

    removeHandler({dataItem}) {
      const r = confirm('Da li ste sigurni da zelite da obrisete');
      if (r === true) {
        for (let index = 0; index < this.idIzBaze.length; index++) {
          if (this.idIzBaze[index].id === dataItem.id) {
            this.idDobijen = this.keyIzBaze[index];
            break;
          }
        }
        this.afs.doc('parrentDB/' + this.idDobijen).delete();
        this.roditelji = [];
      } else {
        return false;
      }
    }

    private closeEditor(grid, rowIndex = this.editedRowIndex) {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }

  // za dodavanje novog children iz modala
  addNewChild(imeChildren: string, prezimeChildren: string, godinaRodjenjaChildren: number,
              mestoRodjenjaChildren: string, opisChildren: string) {

    // prvo da uzme id od childrena
      let idZaAdd = 0;
      if (godinaRodjenjaChildren >= 1900 && godinaRodjenjaChildren <= this.currentYear) {
      // tslint:disable-next-line:prefer-for-of
        for (let index = 0; index < this.idIzBazeChildren.length; index++) {
          if (this.idIzBazeChildren[index].id > idZaAdd) {
            idZaAdd = this.idIzBazeChildren[index].id;
          }
        }
        this.afs.collection('childrenDB').add({id: idZaAdd + 1, ime: imeChildren, prezime: prezimeChildren,
          godinaRodjenja: godinaRodjenjaChildren, mestoRodjenja: mestoRodjenjaChildren, opis: opisChildren});
        this.deca = [];
        // da trigeruje close u modalu jer nece da se ugasi sam
        const el: HTMLElement = this.closeButton.nativeElement as HTMLElement;
        el.click();
      } else { // ako je godina manja ili veca od dozvoljene
        alert('Godina nije dobro uneta');
        return false;
      }
  }

  // da pri ucitavanju modala ponovo polja budu nulirana
  nuliranjePoljaUModalu() {
    (<HTMLInputElement>document.getElementById('ime')).value = '';
    (<HTMLInputElement>document.getElementById('prezime')).value = '';
    (<HTMLInputElement>document.getElementById('godinaRodjenja')).value = '';
    (<HTMLInputElement>document.getElementById('mestoRodjenja')).value = '';
    (<HTMLInputElement>document.getElementById('opis')).value = '';
  }

}
