import RequestParameters from "./request.params";


export class FilterUserParams extends RequestParameters
{

  constructor()
  {
    super();
    this.orderBy = 'createdAt';
    this.orderDirection = 'DESC';
    this.havePhoto =  'false';
    this.fields = ['id','surname','firstName','sex','email','password','country','sex','mainPhoto','refreshToken'];
  }

 
  minAge: number = 0;
  maxAge: number = 130;

  sex: string = '';

  country: string= '';
  city: string = '';

  havePhoto: string = 'false';

  search: string = '';

}
