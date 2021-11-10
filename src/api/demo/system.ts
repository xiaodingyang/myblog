import {
  AccountParams,
  DeptListItem,
  MenuParams,
  RoleParams,
  RolePageParams,
  MenuListGetResultModel,
  DeptListGetResultModel,
  AccountListGetResultModel,
  RolePageListGetResultModel,
  RoleListGetResultModel,
} from './model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  AccountList = '/system/user/list',
  addUser = '/system/user/save',
  deleteUser = '/system/user/delete',
  IsAccountExist = '/system/accountExist',
  DeptList = '/system/getDeptList',
  setRoleStatus = '/system/role/setRoleStatus',
  MenuList = '/system/menu/getMenuList',
  UpdateMenu = '/system/menu/updateMenu',
  DeleteMenu = '/system/menu/deleteMenu',
  UpdateRole = '/system/role/updateRole',
  RolePageList = '/system/role/getRoleList',
  GetAllRoleList = '/system/role/list',
  DeleteRole = '/system/role/deleteRole',
}

export const getAccountList = (params: AccountParams) =>
  defHttp.get<AccountListGetResultModel>({ url: Api.AccountList, params });

export const getDeptList = (params?: DeptListItem) =>
  defHttp.get<DeptListGetResultModel>({ url: Api.DeptList, params });

export const getMenuList = (params?: MenuParams) =>
  defHttp.get<MenuListGetResultModel>({ url: Api.MenuList, params });

export const updateMenu = (params?: MenuParams) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.UpdateMenu, params });

export const deleteMenu = (params?: MenuParams) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.DeleteMenu, params });

export const updateRole = (params?: MenuParams) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.UpdateRole, params });

export const getRoleListByPage = (params?: RolePageParams) =>
  defHttp.get<RolePageListGetResultModel>({ url: Api.RolePageList, params });

export const getAllRoleList = (params?: RoleParams) =>
  defHttp.get<RoleListGetResultModel>({ url: Api.GetAllRoleList, params });

export const deleteRole = (params?: RoleParams) =>
  defHttp.post<RoleListGetResultModel>({ url: Api.DeleteRole, params });

export const addUser = (params?: RoleParams) =>
  defHttp.post<RoleListGetResultModel>({ url: Api.addUser, params });

export const deleteUser = (params?: RoleParams) =>
  defHttp.post<RoleListGetResultModel>({ url: Api.deleteUser, params });

export const setRoleStatus = (params: any) => defHttp.post({ url: Api.setRoleStatus, params });

export const isAccountExist = (account: string) =>
  defHttp.post({ url: Api.IsAccountExist, params: { account } }, { errorMessageMode: 'none' });
