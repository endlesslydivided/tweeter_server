import { OrderItem } from "sequelize";

export default class RequestParameters
{

    private _maxLimit:number = 50;
    private _limit:number = 10;
    private _page:number = 1;
    private _offset:number = 0;

    public get limit() {
        return this._limit;
    }
    public set limit(value: number) {
        this._limit = (value > this._maxLimit) ? this._maxLimit : value;
    }

    public get page() {
        return this._page;
    }
    public set page(value: number) {
        this._page = value;
    }

    public get offset() {
        return this._offset;
    }
    public set offset(value:number) 
    {
        this._offset = value;
    }

    public orderBy: string;
    public orderDirection: string;

    public attributes:string[];
    public fields:string[];

    
}