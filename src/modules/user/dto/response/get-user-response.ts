export interface IGetUserResponse {
  id:number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  password: string;
  birthDate: string;
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
  image: string;
}


export interface IFilterUsersResponse {
  total: number;
  skip: number;
  limit: number;
  users: IGetUserResponse[];
}