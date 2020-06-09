import { Client } from '../models/client';
import { Strategy } from '../models/strategy';
import request from './utils';
import { Bonus } from '../models/bonus';
import { TariffPlan } from '../models/tariffPlan';

export const fetchClients = async () =>
    request
        .get('/clients/aggregates')
        .then(({ data }) => Object.values(data))
        .then<Client[]>(data =>
            data.map((item: any) => ({ ...item.client, bonusCount: item.bonusCount })),
        );

export const createStrategy = async (strategyCreation: Strategy) =>
    request.post('/strategies', {
        ...strategyCreation,
        settings: JSON.stringify(strategyCreation.settings),
    });

export const fetchStrategy = async (id: string) => 
    request.get<Strategy>(`/strategies/${id}`).then(({ data }) => {
        return {
            uuid: data.uuid,
            type: data.type,
            title: data.title,
            settings: JSON.parse(data.settings.toString()),
        }
    });

export const fetchStrategies = async () =>
    request
        .get<Strategy[]>('/strategies')
        .then(({ data }) =>
            data.map(item => ({ ...item, settings: JSON.parse((item as any).settings) })),
        );

export const fetchClient = async (id: string) =>
    request.get<Client>(`/clients/${id}`).then(({ data }) => data);

export const fetchClientBonuses = async (id: string) =>
    request.get<Bonus[]>(`/bonuses?clientId=${id}`).then(({ data }) => data);

export const fetchTariffs = async () =>
    request.get<TariffPlan[]>('tariffPlans').then(({ data }) => data);

export const bindClientWithTariff = (clientId: string, tariffId: string) => {
    request.put(`/clients/link?clientId=${clientId}&tariffPlanId=${tariffId}`);
};

export const createTariffPlan = (tariff: Omit<TariffPlan, 'uuid' | 'strategies'>) =>
    request.post<TariffPlan>(`/tariffPlans`, tariff).then(({ data }) => data);

export const bindStrategyWithTariff = (strategyId: string, tariffId: string) => {
    request.put(`/strategies/link?strategyId=${strategyId}&tariffPlanId=${tariffId}`);
};

export const bindStrategiesWithTariff = (strategyIdList: string[], tariffId: string) => {
    return Promise.all(strategyIdList.map(s => bindStrategyWithTariff(s, tariffId)));
};
