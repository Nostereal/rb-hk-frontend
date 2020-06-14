import { Transaction } from './transaction';
import { Strategy } from './strategy';

export interface Bonus {
    uuid: string;
    amount: number;
    createTime: string;
    transactions: Transaction[];
    strategy: Strategy;
}
