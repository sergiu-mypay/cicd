import { UserModel } from './user';
import { BusinessModel } from './business';
import { ClientModel } from './client';
import { IdentityProviderRelationsModel } from './identityprovidermypayrelations';
import { MerchantModel } from './merchant';
import { RelationshipModel } from './relationship';
import { RoleModel } from './role';
import { UserTypeModel } from './user-type';

import { connectDB } from './db';

export { connectDB };

export default [
  UserModel,
  BusinessModel,
  ClientModel,
  IdentityProviderRelationsModel,
  MerchantModel,
  RelationshipModel,
  RoleModel,
  UserTypeModel,
];
