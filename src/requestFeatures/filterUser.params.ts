import RequestParameters from "./request.params";


export class FilterUserParams extends RequestParameters
{

  constructor()
  {
    super();
    this.orderBy = 'createdAt';
    this.orderDirection = 'DESC';
    this.havePhoto =  'false';
  }

  sex: string = '';

  country: string= '';
  city: string = '';

  havePhoto: string = 'false';

  search: string = '';

}
