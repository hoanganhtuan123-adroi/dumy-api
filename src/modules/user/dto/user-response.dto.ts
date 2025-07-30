export interface IUserResponse {
  id:number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  password: string;
  birthDate: Date;
  height: number;
  weight: number;
  eyeColor: string;
  hairColor: string;
  hairType: string;
  address_address: string;
  address_city: string;
  address_state: string;
  address_stateCode: string;
  address_lat: number;
  address_lng: number;
  address_country: string;
  image?: string;
}


export interface IGetUsersResponse {
  total: number;
  skip: number;
  limit: number;
  users: IUserResponse[];
}


export interface IUserSingleResponse  {
  user: IUserResponse;
}


export interface IDeleteUserResponse {
  idDeleted: number;
  deletedAt: Date;
}