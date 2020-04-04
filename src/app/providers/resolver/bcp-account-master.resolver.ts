import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BcpAccountMasterService } from '../bcp-account-master.service';

@Injectable()
export class UserResolver implements Resolve<Observable<any>> {
  constructor(private bcpAccountMasterService: BcpAccountMasterService) {}

  resolve(): Observable<any> {
    return this.bcpAccountMasterService.getAccountMaster();
  }
}