import axios from 'axios';
import { Bank } from '../types/bank';

export const getBanksByDomain = async (domain: string): Promise<Bank[]> => {
  const response = await axios.get(`${domain}/api/admin/banks`);
  return response.data.data;
};
