import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Functions } from '@app/helpers/functions';

export interface DialogData {
    apicol: any;
    apipoint: any;
    columns: any;
    lokisort: any;
    idParent?: string;
}

@Component({
    selector: 'app-grid-setting-dialog',
    templateUrl: 'grid-settings-dialog.html',
    styleUrls: ['./grid-settings-dialog.scss']
})
export class DialogSettingsGridDialog {

    public apiColumn: any;
    apiPoint: any;
    lokiSort: any;
    id: string;
    _interval: any;
    allColumnIds: Array<any> = [];
    _bufferData: Array<any>;
    constructor(
        public dialogRef: MatDialogRef<DialogSettingsGridDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.apiColumn = data.apicol;
        this.apiPoint = data.apipoint;
        this.lokiSort = data.lokisort
        this.id = data.idParent;

        Object.values(this.apiColumn.getAllColumns() as Object)
        .filter(column => !['', 'id'].includes(column.colDef.field))
        .forEach(column => this.allColumnIds.push({
            name: column.colDef.headerName,
            field: column.colDef.field,
            selected: column.visible
        }));
        this.allColumnIds = this.allColumnIds
            .map( i => JSON.stringify(i))
            .sort()
            .filter((i, k, arr) => i !== arr[k - 1])
            .map(i => JSON.parse(i));
        let ic = this.allColumnIds.findIndex(column => column.field === 'checkbox');
        this.allColumnIds.splice(ic,1);
        let lsIndex = 'result-state';
        if ( this.id ) {
            lsIndex += `-${this.id}`;
        }
        if(localStorage.getItem(lsIndex)){
            this.allColumnIds = Functions.cloneObject(JSON.parse(localStorage.getItem(lsIndex)))
        }
        let i = this.allColumnIds.findIndex(column => column.field === 'checkbox');
        this.allColumnIds.splice(i,1);
        this._bufferData = Functions.cloneObject(this.allColumnIds);
        
    }
    onUpdateProto(event) {
        const objField = event.filter(i => {
            const k = this._bufferData.filter(j => i.name === j.name)[0];
            return i.selected !== k.selected;
        })[0];
        
        this._bufferData = Functions.cloneObject(event);
        this.onChange(objField && objField.selected, objField && objField.field);
        let lsIndex = 'result-state';
        if ( this.id ) {
            lsIndex += `-${this.id}`;
        }
        this.updateGrid();
        if (this._interval) {
            clearTimeout(this._interval);
        }
        this._interval = setTimeout(() => {
            localStorage.setItem(lsIndex, JSON.stringify(this._bufferData));
        }, 50);
        
    }
    onChange(event: boolean, field: string): void {
        this.apiColumn.setColumnVisible(field, event);
        this.apiPoint.sizeColumnsToFit();
    }
    updateGrid(){
        for(let i=0;this._bufferData.length>i;i++){
            this.apiColumn.moveColumn(this._bufferData[i].field, i); 
        }
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
}

